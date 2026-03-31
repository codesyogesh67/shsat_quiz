import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { pickRandom57Ids } from "@/lib/selectors/pickRandom57";

export const runtime = "nodejs";

type SessionMode = "diagnostic" | "practice" | "exam";

type StartSessionBody = {
  mode?: string;
  category?: string;
  examKey?: string;
  count?: number;
  minutes?: number;
};

function isSessionMode(value: unknown): value is SessionMode {
  return value === "diagnostic" || value === "practice" || value === "exam";
}

function shuffle<T>(arr: T[]) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function clampCount(value: number, fallback: number) {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(1, Math.min(100, Math.floor(value)));
}

function clampMinutes(value: number, fallback: number) {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(1, Math.min(300, Math.floor(value)));
}

function getDefaultConfig(mode: SessionMode) {
  switch (mode) {
    case "diagnostic":
      return { count: 12, minutes: 30 };
    case "exam":
      return { count: 57, minutes: 90 };
    case "practice":
    default:
      return { count: 10, minutes: 12 };
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    let body: StartSessionBody = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const mode: SessionMode = isSessionMode(body.mode) ? body.mode : "practice";

    const defaults = getDefaultConfig(mode);

    const count = clampCount(
      typeof body.count === "number" ? body.count : defaults.count,
      defaults.count
    );

    const minutes = clampMinutes(
      typeof body.minutes === "number" ? body.minutes : defaults.minutes,
      defaults.minutes
    );

    const category =
      typeof body.category === "string" && body.category.trim()
        ? body.category.trim()
        : undefined;

    const examKey =
      typeof body.examKey === "string" && body.examKey.trim()
        ? body.examKey.trim()
        : undefined;

    const dbUserId = clerkUserId
      ? (
          await prisma.user.findUnique({
            where: { externalAuthId: clerkUserId },
            select: { id: true },
          })
        )?.id ?? null
      : null;

    let questionIds: string[] = [];

    if (mode === "exam") {
      if (examKey && examKey !== "random") {
        const rows = await prisma.question.findMany({
          where: {
            examKey: {
              equals: examKey,
              mode: "insensitive",
            },
          },
          select: { id: true },
          orderBy: { index: "asc" },
        });

        questionIds = rows.slice(0, count).map((q) => q.id);
      } else if (count === 57) {
        questionIds = await pickRandom57Ids();
      } else {
        const rows = await prisma.question.findMany({
          select: { id: true },
        });

        questionIds = shuffle(rows)
          .slice(0, count)
          .map((q) => q.id);
      }
    } else if (mode === "practice" && category !== undefined) {
      let rows = await prisma.question.findMany({
        where: {
          category: {
            equals: category,
            mode: "insensitive",
          },
        },
        select: { id: true },
      });

      if (rows.length === 0) {
        rows = await prisma.question.findMany({
          select: { id: true },
        });
      }

      questionIds = shuffle(rows)
        .slice(0, count)
        .map((q) => q.id);
    } else {
      const rows = await prisma.question.findMany({
        select: { id: true },
      });

      questionIds = shuffle(rows)
        .slice(0, count)
        .map((q) => q.id);
    }

    if (questionIds.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error: "No questions found for this session.",
        },
        { status: 400 }
      );
    }

    const label =
      mode === "diagnostic"
        ? "Diagnostic"
        : mode === "exam"
        ? examKey
          ? `Exam — ${examKey}`
          : "Exam"
        : category !== undefined
        ? `Topic Practice — ${category}`
        : "Practice";

    const session = await prisma.session.create({
      data: {
        userId: dbUserId,
        examKey: examKey ?? null,
        mode,
        label,
        minutes,
        scoreTotal: questionIds.length,
        questionIds,
      },
      select: {
        id: true,
        minutes: true,
        startedAt: true,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        sessionId: session.id,
        minutes: session.minutes,
        startedAt: session.startedAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("session start error", error);

    return NextResponse.json(
      { ok: false, error: "Failed to start session." },
      { status: 500 }
    );
  }
}
