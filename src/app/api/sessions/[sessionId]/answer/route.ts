import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

function normalizeQuestionIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((id): id is string => typeof id === "string");
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const body = await req.json();

  const {
    questionId,
    flagged,
    timeSpentDeltaSec = 0,
  }: {
    questionId: string;
    flagged?: boolean;
    timeSpentDeltaSec?: number;
  } = body;

  const hasAnswerField = Object.prototype.hasOwnProperty.call(body, "answer");
  const answer = hasAnswerField ? body.answer : undefined;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { questionIds: true },
  });

  const questionIds = normalizeQuestionIds(session?.questionIds);

  if (!session || !questionIds.includes(questionId)) {
    return NextResponse.json(
      { ok: false, error: "INVALID_QUESTION" },
      { status: 400 }
    );
  }

  const q = hasAnswerField
    ? await prisma.question.findUnique({
        where: { id: questionId },
        select: { answer: true },
      })
    : null;

  const existingAttempt = await prisma.attempt.findUnique({
    where: { sessionId_questionId: { sessionId, questionId } },
    select: { sessionId: true },
  });

  const updateData: Record<string, unknown> = {
    timeSpentSec: { increment: Math.max(0, timeSpentDeltaSec) },
  };

  if (typeof flagged === "boolean") {
    updateData.flagged = flagged;
  }

  if (hasAnswerField) {
    const normalizedAnswer =
      answer === null || String(answer).trim() === "" ? null : String(answer);

    updateData.givenAnswer = normalizedAnswer;
    updateData.isCorrect = q ? normalizedAnswer === q.answer : null;

    if (normalizedAnswer !== null) {
      updateData.firstAnsweredAt = new Date();
    }
  }

  if (existingAttempt) {
    await prisma.attempt.update({
      where: { sessionId_questionId: { sessionId, questionId } },
      data: updateData,
    });
  } else {
    const normalizedAnswer = hasAnswerField
      ? answer === null || String(answer).trim() === ""
        ? null
        : String(answer)
      : null;

    await prisma.attempt.create({
      data: {
        sessionId,
        questionId,
        givenAnswer: normalizedAnswer,
        isCorrect: hasAnswerField && q ? normalizedAnswer === q.answer : null,
        flagged: !!flagged,
        timeSpentSec: Math.max(0, timeSpentDeltaSec),
        firstAnsweredAt: normalizedAnswer !== null ? new Date() : null,
      },
    });
  }

  const attempts = await prisma.attempt.findMany({
    where: { sessionId },
    select: {
      givenAnswer: true,
      isCorrect: true,
      flagged: true,
    },
  });

  const answeredCount = attempts.reduce((count, attempt) => {
    const hasAnswer =
      attempt.givenAnswer !== null && String(attempt.givenAnswer).trim() !== "";
    return hasAnswer ? count + 1 : count;
  }, 0);

  const correctCount = attempts.filter((a) => a.isCorrect === true).length;
  const flagsCount = attempts.filter((a) => a.flagged).length;

  await prisma.session.update({
    where: { id: sessionId },
    data: {
      scoreCorrect: correctCount,
      progressCount: answeredCount,
      flagsCount,
    },
  });

  return NextResponse.json({
    ok: true,
    correctCount,
    answeredCount,
    flagsCount,
  });
}
