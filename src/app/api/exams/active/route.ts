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

  const s = await prisma.session.findFirst({
    where: { userId: dbUser.id, submittedAt: null },
    orderBy: { startedAt: "desc" },
    select: { id: true, minutes: true, questionIds: true, startedAt: true },
  });
  if (!s) return new Response(null, { status: 204 });

  const attempts = await prisma.attempt.findMany({
    where: { sessionId: s.id },
    select: {
      questionId: true,
      givenAnswer: true,
      flagged: true,
      timeSpentSec: true,
    },
  });

  return NextResponse.json({
    sessionId: s.id,
    minutes: s.minutes,
    startedAt: s.startedAt,
    questionIds: s.questionIds,
    responses: Object.fromEntries(
      attempts.map((a) => [
        a.questionId,
        {
          questionId: a.questionId,
          answer: a.givenAnswer,
          flagged: a.flagged,
          timeSpentSec: a.timeSpentSec,
        },
      ])
    ),
  });
}
