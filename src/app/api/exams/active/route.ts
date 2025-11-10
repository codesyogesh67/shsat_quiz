import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

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

  // ⬅️ get ALL active (not submitted) sessions for this user
  const sessions = await prisma.session.findMany({
    where: { userId: dbUser.id, submittedAt: null },
    orderBy: { startedAt: "desc" },
    select: { id: true, minutes: true, questionIds: true, startedAt: true },
  });

  // no active sessions
  if (!sessions.length) return new Response(null, { status: 204 });

  // for each session, get its attempts
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

  // group attempts by sessionId
  const attemptsBySession: Record<string, any> = {};
  for (const s of sessionIds) {
    attemptsBySession[s] = {};
  }
  for (const a of attempts) {
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

  // build response array
  const payload = sessions.map((s) => ({
    sessionId: s.id,
    minutes: s.minutes,
    startedAt: s.startedAt,
    questionIds: s.questionIds,
    responses: attemptsBySession[s.id] ?? {},
  }));

  return NextResponse.json(payload);
}
