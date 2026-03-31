import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import PendingSessionResults from "@/app/(appshell)/_components/PendingSessionResults";
import PracticeResultsClient from "./PracticeResultsClient";
import type { CategoryResult, SessionResultsData } from "@/types/exam";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ sessionId: string }>;
};

function toPercent(numerator: number, denominator: number) {
  if (!denominator) return 0;
  return Math.round((numerator / denominator) * 100);
}

export default async function PracticeResultsPage({ params }: PageProps) {
  const { sessionId } = await params;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      mode: true,
      submittedAt: true,
      scoreCorrect: true,
      scoreTotal: true,
      attempts: {
        select: {
          questionId: true,
          isCorrect: true,
          flagged: true,
          givenAnswer: true,
          question: {
            select: {
              index: true,
              category: true,
              answer: true,
            },
          },
        },
        orderBy: {
          question: {
            index: "asc",
          },
        },
      },
    },
  });

  if (!session) {
    return (
      <PendingSessionResults
        title="Preparing your practice results"
        message="Your practice results are being finalized. This page will refresh automatically."
      />
    );
  }

  if (session.mode === "DIAGNOSTIC") {
    notFound();
  }

  if (
    !session.submittedAt ||
    session.scoreCorrect == null ||
    session.scoreTotal == null
  ) {
    return (
      <PendingSessionResults
        title="Preparing your practice results"
        message="Your practice results are being finalized. This page will refresh automatically."
      />
    );
  }

  const total = session.scoreTotal;
  const correct = session.scoreCorrect;

  const wrong = session.attempts.filter(
    (attempt) => attempt.isCorrect === false
  ).length;

  const unanswered = Math.max(0, total - correct - wrong);

  const byCategoryMap = new Map<string, CategoryResult>();

  for (const attempt of session.attempts) {
    const category = attempt.question?.category ?? "Uncategorized";

    if (!byCategoryMap.has(category)) {
      byCategoryMap.set(category, {
        total: 0,
        correct: 0,
        wrong: 0,
        unanswered: 0,
        accuracy: 0,
      });
    }

    const bucket = byCategoryMap.get(category)!;
    bucket.total += 1;

    if (attempt.isCorrect === true) {
      bucket.correct += 1;
    } else if (attempt.isCorrect === false) {
      bucket.wrong += 1;
    } else {
      bucket.unanswered += 1;
    }
  }

  for (const [, value] of byCategoryMap) {
    value.unanswered = Math.max(0, value.total - value.correct - value.wrong);
    value.accuracy = toPercent(value.correct, value.total);
  }

  const byCategory = Object.fromEntries(byCategoryMap.entries());

  const results: SessionResultsData = {
    score: toPercent(correct, total),
    accuracy: toPercent(correct, total),
    correct,
    wrong,
    unanswered,
    total,
    byCategory,
    perQuestion: session.attempts.map((attempt, i) => ({
      id: attempt.questionId,
      index: attempt.question?.index ?? i + 1,
      correct: attempt.isCorrect === true,
      user: attempt.givenAnswer ?? undefined,
      gold: attempt.question?.answer ?? undefined,
      category: attempt.question?.category ?? "Uncategorized",
      flagged: attempt.flagged ?? false,
    })),
  };

  return <PracticeResultsClient sessionId={session.id} results={results} />;
}
