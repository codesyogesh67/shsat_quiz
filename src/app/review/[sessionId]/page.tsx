// app/review/[sessionId]/page.tsx
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import ReviewClient from "@/components/review/ReviewClient";

export const runtime = "nodejs";

export type ReviewRow = {
  qnum: number;
  questionId: string;
  stem: string;
  category: string | null;
  gold: string | null;
  user: string | null;
  correct: boolean | null;
  flagged: boolean;
};

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      label: true,
      examKey: true,
      minutes: true,
      scoreCorrect: true,
      scoreTotal: true,
      submittedAt: true,
      questionIds: true,
      startedAt: true,
    },
  });
  if (!session || !session.submittedAt) notFound();

  const attempts = await prisma.attempt.findMany({
    where: { sessionId },
    select: {
      questionId: true,
      givenAnswer: true,
      isCorrect: true,
      flagged: true,
      question: { select: { stem: true, category: true, answer: true } },
    },
  });

  // map by question for frozen ordering
  const map = new Map(
    attempts.map((a) => [
      a.questionId,
      {
        questionId: a.questionId,
        stem: a.question?.stem ?? "",
        category: a.question?.category ?? null,
        gold: a.question?.answer ?? null,
        user: a.givenAnswer ?? null,
        correct: a.isCorrect,
        flagged: a.flagged,
      },
    ])
  );

  const rows: ReviewRow[] = session.questionIds.map((qid, i) => {
    const r = map.get(qid);
    return {
      qnum: i + 1,
      questionId: qid,
      stem: r?.stem ?? "(unavailable)",
      category: r?.category ?? null,
      gold: r?.gold ?? null,
      user: r?.user ?? null,
      correct: r?.correct ?? false,
      flagged: r?.flagged ?? false,
    };
  });

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <ReviewClient
        sessionMeta={{
          sessionId: session.id,
          title: session.label ?? session.examKey ?? "SHSAT Practice",
          summary: `${session.scoreCorrect}/${session.scoreTotal} · ${
            session.minutes ?? 0
          } min`,
        }}
        rows={rows}
      />
    </div>
  );
}
