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

  // Not signed in → 204 (no body!)
  if (!clerkUserId) return new Response(null, { status: 204 });

  // Map Clerk → local User.id
  const dbUser = await prisma.user.findUnique({
    where: { externalAuthId: clerkUserId },
    select: { id: true },
  });
  if (!dbUser) return new Response(null, { status: 204 });

  // 1) get ALL active (not submitted) sessions for this user
  const sessions = await prisma.session.findMany({
    where: { userId: dbUser.id, submittedAt: null },
    orderBy: { startedAt: "desc" },
    select: {
      id: true,
      minutes: true,
      questionIds: true,
      startedAt: true,
    },
  });

  // no active sessions
  if (!sessions.length) return new Response(null, { status: 204 });

  // 2) get all attempts that belong to those sessions
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

  // 3) group attempts by sessionId, fully typed
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

  // init each sessionId so we always have an object
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

  // 4) build response array
  const payload = sessions.map((s) => ({
    sessionId: s.id,
    minutes: s.minutes,
    startedAt: s.startedAt,
    questionIds: s.questionIds,
    responses: attemptsBySession[s.id] ?? {},
  }));

  return NextResponse.json(payload);
}
