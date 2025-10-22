// app/exam/[sessionId]/page.tsx
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import ExamShell from "@/components/exam/ExamShell";
import type { ExamQuestion } from "@/components/exam/useExamController";

export const runtime = "nodejs";
// Optional while debugging auth/cookies/caching:
// export const dynamic = "force-dynamic";

function orderByFrozen<T extends { id: string }>(
  ids: string[],
  rows: T[]
): T[] {
  const pos = new Map(ids.map((id, i) => [id, i]));
  return [...rows].sort((a, b) => pos.get(a.id)! - pos.get(b.id)!);
}

export default async function ExamSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      minutes: true,
      questionIds: true,
      submittedAt: true,
    },
  });

  if (!session) notFound();

  // You can choose to block already-submitted attempts:
  // if (session.submittedAt) notFound();

  // Fetch only the questions in this frozen set
  const qs = await prisma.question.findMany({
    where: { id: { in: session.questionIds } },
    select: {
      id: true,
      type: true,
      category: true,
      stem: true,
      media: true,
      choices: true,
      examKey: true,
    },
  });

  if (!qs.length) notFound();

  const questions: ExamQuestion[] = orderByFrozen(session.questionIds, qs).map(
    (q) => ({
      id: q.id,
      type: q.type as any, // aligns with your enum type
      category: q.category,
      stem: q.stem,
      media: q.media as any,
      choices: q.choices as any,
      examSet: q.examKey,
    })
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 md:px-10 lg:px-20 xl:px-28 py-6">
      <ExamShell
        sessionId={session.id}
        minutes={session.minutes ?? 90}
        questions={questions}
        // If you later implement resume, pass initialAnswers/flags/seconds here
      />
    </div>
  );
}
