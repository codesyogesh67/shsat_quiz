import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

function normalizeQuestionIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((id): id is string => typeof id === "string");
}

export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await context.params;
    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { externalAuthId: userId },
      select: { id: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const previousSession = await prisma.session.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        userId: true,
        mode: true,
        minutes: true,
        questionIds: true,
      },
    });

    if (!previousSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (previousSession.userId !== dbUser.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const questionIds = normalizeQuestionIds(previousSession.questionIds);

    if (questionIds.length === 0) {
      return NextResponse.json(
        { error: "This session has no questions to retake." },
        { status: 400 }
      );
    }

    const newSession = await prisma.session.create({
      data: {
        userId: dbUser.id,
        mode: previousSession.mode,
        minutes: previousSession.minutes ?? 30,
        questionIds,
        startedAt: new Date(),
        submittedAt: null,
        scoreCorrect: 0,
        scoreTotal: questionIds.length,
      },
      select: {
        id: true,
      },
    });

    return NextResponse.json({
      ok: true,
      sessionId: newSession.id,
      redirectTo: `/session/${newSession.id}`,
    });
  } catch (error) {
    console.error("[session retake] failed:", error);
    return NextResponse.json(
      { error: "Failed to create retake session." },
      { status: 500 }
    );
  }
}
