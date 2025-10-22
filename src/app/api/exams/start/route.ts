// src/app/api/exams/start/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAuth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { pickRandom57Ids } from "@/lib/selectors/pickRandom57";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { userId: clerkUserId } = await getAuth(req); // ✅ must be awaited
  const {
    examKey,
    mode = "full",
    minutes = 90,
  } = await req.json().catch(() => ({}));

  // 🔑 Map Clerk user → local DB user.id (or null for guest)
  const dbUserId = clerkUserId
    ? (
        await prisma.user.findUnique({
          where: { externalAuthId: clerkUserId },
          select: { id: true },
        })
      )?.id ?? null
    : null;

  // Select 57 random question IDs or use fixed set
  const questionIds =
    examKey && examKey.startsWith("shsat_")
      ? (
          await prisma.question.findMany({
            where: { examKey },
            select: { id: true },
            orderBy: { index: "asc" },
          })
        )
          .slice(0, 57)
          .map((q) => q.id)
      : await pickRandom57Ids();

  const session = await prisma.session.create({
    data: {
      userId: dbUserId ?? null,
      examKey: examKey ?? "random-57",
      label: "SHSAT Practice",
      mode,
      minutes,
      scoreTotal: questionIds.length,
      questionIds,
    },
  });

  return NextResponse.json(
    {
      sessionId: session.id,
      questionIds,
      minutes: session.minutes,
      startedAt: session.startedAt,
    },
    { status: 201 }
  );
}
