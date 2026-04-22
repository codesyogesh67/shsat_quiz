// app/review/[sessionId]/page.tsx
import { notFound } from "next/navigation";
import { Prisma } from "@prisma/client";

import prisma from "@/lib/prisma";
import PracticeReviewShell from "@/components/practice/PracticeReviewShell";

export const runtime = "nodejs";

function isNonNull<T>(value: T | null | undefined): value is T {
  return value != null;
}

function toStringArray(value: Prisma.JsonValue): string[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const onlyStrings = value.filter(
    (item): item is string => typeof item === "string"
  );

  return onlyStrings.length > 0 ? onlyStrings : undefined;
}

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  if (!session || !session.submittedAt) {
    notFound();
  }

  const attempts = await prisma.attempt.findMany({
    where: { sessionId },
  });

  const questionIds = Array.isArray(session.questionIds)
    ? session.questionIds.filter((id): id is string => typeof id === "string")
    : [];

  if (questionIds.length === 0) {
    return (
      <PracticeReviewShell
        sessionId={sessionId}
        filter="all"
        session={session}
        questions={[]}
        attempts={attempts}
      />
    );
  }

  const questions = await prisma.question.findMany({
    where: {
      id: {
        in: questionIds,
      },
    },
  });

  const questionMap = new Map(questions.map((q) => [q.id, q]));

  const questionsInOrder = questionIds
    .map((id) => questionMap.get(id))
    .filter(isNonNull);

  const normalizedQuestions = questionsInOrder.map((q) => ({
    ...q,
    choices: toStringArray(q.choices),
  }));

  return (
    <PracticeReviewShell
      sessionId={sessionId}
      filter="all"
      session={session}
      questions={normalizedQuestions}
      attempts={attempts}
    />
  );
}
