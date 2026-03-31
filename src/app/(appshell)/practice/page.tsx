import type { Metadata } from "next";
import { Prisma } from "@prisma/client";

import PracticeShell from "@/components/practice/PracticeShell";
import PracticeReviewShell from "@/components/practice/PracticeReviewShell";
import prisma from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Practice | SHSAT Practice",
};

const CATEGORIES = [
  "Algebra",
  "Arithmetic",
  "Geometry",
  "Probability and Statistics",
] as const;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type PracticePageProps = {
  searchParams?: SearchParams;
};

function isNonNull<T>(value: T | null | undefined): value is T {
  return value != null;
}

function getSingleSearchParam(
  value: string | string[] | undefined
): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0];
  return undefined;
}

function toStringArray(value: Prisma.JsonValue): string[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const onlyStrings = value.filter(
    (item): item is string => typeof item === "string"
  );

  return onlyStrings.length > 0 ? onlyStrings : undefined;
}

async function getAvailableCategories() {
  try {
    const results = await Promise.all(
      CATEGORIES.map(async (category) => {
        const count = await prisma.question.count({
          where: { category },
        });

        return {
          name: category,
          count,
        };
      })
    );

    return results;
  } catch (error) {
    console.error("getAvailableCategories failed:", error);

    return CATEGORIES.map((category) => ({
      name: category,
      count: 0,
    }));
  }
}

async function getPracticeReviewData(sessionId: string) {
  try {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) return null;

    const attempts = await prisma.attempt.findMany({
      where: { sessionId },
    });

    const questionIds = Array.isArray(session.questionIds)
      ? session.questionIds.filter((id): id is string => typeof id === "string")
      : [];

    if (questionIds.length === 0) {
      return {
        session,
        attempts,
        questions: [],
      };
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

    return {
      session,
      attempts,
      questions: questionsInOrder,
    };
  } catch (error) {
    console.error("getPracticeReviewData failed:", error);
    return null;
  }
}

export default async function PracticePage({
  searchParams,
}: PracticePageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const reviewSession = getSingleSearchParam(
    resolvedSearchParams.reviewSession
  );
  const filter = getSingleSearchParam(resolvedSearchParams.filter) ?? "all";

  if (reviewSession) {
    const reviewData = await getPracticeReviewData(reviewSession);

    if (!reviewData) {
      return (
        <div className="mx-auto max-w-3xl px-4 py-10">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h1 className="text-xl font-semibold text-slate-900">
              Review session not found
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              The practice review session could not be loaded.
            </p>
          </div>
        </div>
      );
    }

    const normalizedQuestions = reviewData.questions.map((q) => ({
      ...q,
      choices: toStringArray(q.choices),
    }));

    return (
      <PracticeReviewShell
        sessionId={reviewSession}
        filter={filter}
        session={reviewData.session}
        questions={normalizedQuestions}
        attempts={reviewData.attempts}
      />
    );
  }

  const availableCategories = await getAvailableCategories();

  return <PracticeShell availableCategories={availableCategories} />;
}
