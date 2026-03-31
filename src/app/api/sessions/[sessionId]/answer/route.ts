import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const {
    questionId,
    answer,
    flagged,
    timeSpentDeltaSec = 0,
  } = await req.json();

  // ✅ Security: ensure question is part of this session
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { questionIds: true },
  });
  if (!session || !session.questionIds.includes(questionId)) {
    return NextResponse.json(
      { ok: false, error: "invalid question" },
      { status: 400 }
    );
  }

  const q = await prisma.question.findUnique({
    where: { id: questionId },
    select: { answer: true },
  });

  await prisma.attempt.upsert({
    where: { sessionId_questionId: { sessionId, questionId } },
    update: {
      givenAnswer: answer ?? null,
      isCorrect: q ? (answer ?? null) === q.answer : null,
      flagged: typeof flagged === "boolean" ? flagged : undefined,
      timeSpentSec: { increment: Math.max(0, timeSpentDeltaSec) },
      firstAnsweredAt: { set: new Date() },
    },
    create: {
      sessionId,
      questionId,
      givenAnswer: answer ?? null,
      isCorrect: q ? (answer ?? null) === q.answer : null,
      flagged: !!flagged,
    },
  });

  // small aggregates for progress UI
  const [correctCount, answeredCount, flagsCount] = await Promise.all([
    prisma.attempt.count({ where: { sessionId, isCorrect: true } }),
    prisma.attempt.count({ where: { sessionId, givenAnswer: { not: null } } }),
    prisma.attempt.count({ where: { sessionId, flagged: true } }),
  ]);

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
