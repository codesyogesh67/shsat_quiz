import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

function normalizeQuestionIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((id): id is string => typeof id === "string");
}

type CategorySummary = {
  total: number;
  answered: number;
  correct: number;
  wrong: number;
  unanswered: number;
  flagged: number;
  accuracy: number;
};

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        submittedAt: true,
        scoreCorrect: true,
        scoreTotal: true,
        minutes: true,
        questionIds: true,
        categoryBreakdown: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        { ok: false, error: "SESSION_NOT_FOUND" },
        { status: 404 }
      );
    }

    if (session.submittedAt) {
      return NextResponse.json({
        ok: true,
        alreadySubmitted: true,
        scoreCorrect: session.scoreCorrect,
        scoreTotal: session.scoreTotal,
        submittedAt: session.submittedAt,
        minutes: session.minutes,
        categoryBreakdown: session.categoryBreakdown ?? {},
      });
    }

    const questionIds = normalizeQuestionIds(session.questionIds);
    const totalQuestions = questionIds.length;
    const minimumRequired = Math.ceil(totalQuestions * 0.5);

    const [questions, attempts] = await Promise.all([
      prisma.question.findMany({
        where: {
          id: {
            in: questionIds,
          },
        },
        select: {
          id: true,
          category: true,
        },
      }),
      prisma.attempt.findMany({
        where: { sessionId },
        select: {
          questionId: true,
          givenAnswer: true,
          isCorrect: true,
          flagged: true,
        },
      }),
    ]);

    const attemptsByQuestionId = new Map(
      attempts.map((attempt) => [attempt.questionId, attempt])
    );

    const answeredQuestionIds = new Set(
      attempts
        .filter(
          (attempt) =>
            attempt.givenAnswer !== null &&
            String(attempt.givenAnswer).trim() !== ""
        )
        .map((attempt) => attempt.questionId)
    );

    const answeredCount = answeredQuestionIds.size;

    if (answeredCount < minimumRequired) {
      return NextResponse.json(
        {
          ok: false,
          error: "MINIMUM_NOT_REACHED",
          message: `You must answer at least ${minimumRequired} of ${totalQuestions} questions before submitting.`,
          answeredCount,
          minimumRequired,
          totalQuestions,
        },
        { status: 400 }
      );
    }

    const byCategory: Record<string, CategorySummary> = {};
    let correctCount = 0;
    let flagsCount = 0;

    for (const question of questions) {
      const category = question.category?.trim() || "Uncategorized";
      const attempt = attemptsByQuestionId.get(question.id);

      const hasAnswer =
        attempt?.givenAnswer !== null &&
        attempt?.givenAnswer !== undefined &&
        String(attempt.givenAnswer).trim() !== "";

      const isCorrect = attempt?.isCorrect === true;
      const isWrong = hasAnswer && !isCorrect;
      const isUnanswered = !hasAnswer;
      const isFlagged = attempt?.flagged === true;

      if (!byCategory[category]) {
        byCategory[category] = {
          total: 0,
          answered: 0,
          correct: 0,
          wrong: 0,
          unanswered: 0,
          flagged: 0,
          accuracy: 0,
        };
      }

      byCategory[category].total += 1;

      if (hasAnswer) {
        byCategory[category].answered += 1;
      }

      if (isCorrect) {
        byCategory[category].correct += 1;
        correctCount += 1;
      }

      if (isWrong) {
        byCategory[category].wrong += 1;
      }

      if (isUnanswered) {
        byCategory[category].unanswered += 1;
      }

      if (isFlagged) {
        byCategory[category].flagged += 1;
        flagsCount += 1;
      }
    }

    for (const category of Object.keys(byCategory)) {
      const row = byCategory[category];
      row.accuracy = row.total ? row.correct / row.total : 0;
    }

    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: {
        submittedAt: new Date(),
        scoreCorrect: correctCount,
        scoreTotal: totalQuestions,
        progressCount: answeredCount,
        flagsCount,
        categoryBreakdown: byCategory,
      },
      select: {
        scoreCorrect: true,
        scoreTotal: true,
        submittedAt: true,
        minutes: true,
        categoryBreakdown: true,
      },
    });

    return NextResponse.json({
      ok: true,
      answeredCount,
      minimumRequired,
      totalQuestions,
      ...updatedSession,
    });
  } catch (error) {
    console.error("session submit error:", error);

    return NextResponse.json(
      { ok: false, error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}
