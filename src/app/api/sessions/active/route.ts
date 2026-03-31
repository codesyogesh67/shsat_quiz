import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

type AttemptRow = {
  sessionId: string;
  questionId: string;
  givenAnswer: string | null;
  flagged: boolean;
  timeSpentSec: number;
};

export async function GET() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) return new Response(null, { status: 204 });

  const dbUser = await prisma.user.findUnique({
    where: { externalAuthId: clerkUserId },
    select: { id: true },
  });

  if (!dbUser) return new Response(null, { status: 204 });

  const sessions = await prisma.session.findMany({
    where: {
      userId: dbUser.id,
      submittedAt: null,
    },
    orderBy: { startedAt: "desc" },
    take: 10,
    select: {
      id: true,
      label: true,
      mode: true,
      scoreCorrect: true,
      scoreTotal: true,
      startedAt: true,
      submittedAt: true,
      minutes: true,
      progressCount: true,
      questionIds: true,
    },
  });

  if (!sessions.length) return new Response(null, { status: 204 });

  const sessionIds = sessions.map((s) => s.id);

  const attempts = await prisma.attempt.findMany({
    where: { sessionId: { in: sessionIds } },
    select: {
      sessionId: true,
      questionId: true,
      givenAnswer: true,
      flagged: true,
      timeSpentSec: true,
    },
  });

  const attemptsBySession: Record<
    string,
    Record<
      string,
      {
        questionId: string;
        answer: string | null;
        flagged: boolean;
        timeSpentSec: number;
      }
    >
  > = {};

  for (const id of sessionIds) {
    attemptsBySession[id] = {};
  }

  for (const a of attempts as AttemptRow[]) {
    if (!attemptsBySession[a.sessionId]) {
      attemptsBySession[a.sessionId] = {};
    }

    attemptsBySession[a.sessionId][a.questionId] = {
      questionId: a.questionId,
      answer: a.givenAnswer,
      flagged: a.flagged,
      timeSpentSec: a.timeSpentSec,
    };
  }

  const payload = sessions.map((s) => ({
    sessionId: s.id,
    label: s.label,
    mode: s.mode,
    scoreCorrect: s.scoreCorrect,
    scoreTotal: s.scoreTotal,
    startedAt: s.startedAt,
    submittedAt: s.submittedAt,
    minutes: s.minutes,
    progressCount: s.progressCount,
    questionIds: s.questionIds,
    responses: attemptsBySession[s.id] ?? {},
  }));

  return NextResponse.json(payload);
}
