import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import ExamShell from "@/components/exam/ExamShell";
import type { ExamQuestion } from "@/components/exam/useExamController";
import type { Prisma } from "@prisma/client"; // ✅ use Prisma types

function orderByFrozen<T extends { id: string }>(
  ids: string[],
  rows: T[]
): T[] {
  const pos = new Map(ids.map((id, i) => [id, i]));
  return [...rows].sort((a, b) => (pos.get(a.id) ?? 0) - (pos.get(b.id) ?? 0));
}

// 🔒 strongly type your select
const questionSelect = {
  id: true,
  type: true,
  category: true,
  stem: true,
  media: true,
  choices: true,
  examKey: true,
} as const;

// 🎯 derive the exact row type returned by that select
type DBQuestion = Prisma.QuestionGetPayload<{ select: typeof questionSelect }>;

export default async function ExamSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { id: true, minutes: true, questionIds: true, submittedAt: true },
  });
  if (!session) notFound();

  const qs = await prisma.question.findMany({
    where: { id: { in: session.questionIds } },
    select: questionSelect,
  });
  if (!qs.length) notFound();

  const questions: ExamQuestion[] = orderByFrozen(session.questionIds, qs).map(
    (q: DBQuestion) => ({
      id: q.id,
      type: q.type as ExamQuestion["type"],
      category: q.category,
      stem: q.stem,
      // If these are Prisma.JsonValue, cast or add a narrow helper if you prefer
      media: q.media as ExamQuestion["media"],
      choices: q.choices as ExamQuestion["choices"],
      examSet: q.examKey ?? undefined,
    })
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 md:px-10 lg:px-20 xl:px-28 py-6">
      <ExamShell
        sessionId={session.id}
        minutes={session.minutes ?? 90}
        questions={questions}
      />
    </div>
  );
}
