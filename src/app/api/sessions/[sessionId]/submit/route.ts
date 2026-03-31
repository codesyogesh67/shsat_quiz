import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

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
      });
    }

    const attempts = await prisma.attempt.findMany({
      where: { sessionId },
      select: {
        questionId: true,
        givenAnswer: true,
      },
    });

    const totalQuestions = session.questionIds.length;
    const minimumRequired = Math.ceil(totalQuestions * 0.5);

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

    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: {
        submittedAt: new Date(),
      },
      select: {
        scoreCorrect: true,
        scoreTotal: true,
        submittedAt: true,
        minutes: true,
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
