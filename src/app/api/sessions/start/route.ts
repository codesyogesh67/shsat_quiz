import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { pickRandom57Ids } from "@/lib/selectors/pickRandom57";

export const runtime = "nodejs";

type SessionMode = "diagnostic" | "practice" | "exam" | "topic";

type StartSessionBody = {
  mode?: string;
  category?: string;
  examKey?: string;
  count?: number;
  minutes?: number;
};

type AttemptRow = {
  questionId: string | null;
  isCorrect: boolean | null;
  createdAt: Date;
};

type AttemptSummary = {
  questionId: string;
  attempts: number;
  wrongAttempts: number;
  correctAttempts: number;
  lastIsCorrect: boolean | null;
  lastAttemptedAt: Date;
};

function isSessionMode(value: unknown): value is SessionMode {
  return (
    value === "diagnostic" ||
    value === "practice" ||
    value === "exam" ||
    value === "topic"
  );
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
    case "topic":
    case "practice":
    default:
      return { count: 10, minutes: 12 };
  }
}

function daysSince(date: Date) {
  const diff = Date.now() - date.getTime();
  return Math.max(0, diff / (1000 * 60 * 60 * 24));
}

function uniqueIds(ids: string[]) {
  return Array.from(new Set(ids));
}

function takeUnique(ids: string[], count: number) {
  const seen = new Set<string>();
  const out: string[] = [];

  for (const id of ids) {
    if (seen.has(id)) continue;

    seen.add(id);
    out.push(id);

    if (out.length >= count) break;
  }

  return out;
}

function buildAttemptSummary(attempts: AttemptRow[]) {
  const map = new Map<string, AttemptSummary>();

  for (const attempt of attempts) {
    if (!attempt.questionId) continue;

    const existing = map.get(attempt.questionId);

    if (!existing) {
      map.set(attempt.questionId, {
        questionId: attempt.questionId,
        attempts: 1,
        wrongAttempts: attempt.isCorrect === false ? 1 : 0,
        correctAttempts: attempt.isCorrect === true ? 1 : 0,
        lastIsCorrect: attempt.isCorrect,
        lastAttemptedAt: attempt.createdAt,
      });

      continue;
    }

    existing.attempts += 1;
    existing.wrongAttempts += attempt.isCorrect === false ? 1 : 0;
    existing.correctAttempts += attempt.isCorrect === true ? 1 : 0;

    if (attempt.createdAt > existing.lastAttemptedAt) {
      existing.lastAttemptedAt = attempt.createdAt;
      existing.lastIsCorrect = attempt.isCorrect;
    }
  }

  return map;
}

function scoreAttemptedQuestion(summary: AttemptSummary) {
  let score = Math.random() * 0.35;
  const age = daysSince(summary.lastAttemptedAt);

  if (summary.lastIsCorrect === false) {
    score += 5;
    score += Math.min(3, summary.wrongAttempts * 0.7);
    score += Math.min(2, age / 3);
  }

  if (summary.lastIsCorrect === true) {
    score -= 2;

    if (age >= 7) score += 0.75;
    if (age >= 14) score += 0.75;
    if (age >= 30) score += 0.75;
  }

  if (age < 1 && summary.lastIsCorrect === true) {
    score -= 5;
  }

  if (age < 1 && summary.lastIsCorrect === false) {
    score += 1;
  }

  return score;
}

async function getDbUserId(clerkUserId: string | null) {
  if (!clerkUserId) return null;

  const dbUser = await prisma.user.findUnique({
    where: { externalAuthId: clerkUserId },
    select: { id: true },
  });

  return dbUser?.id ?? null;
}

async function getQuestionPool(category?: string) {
  const isMixed = !category || category === "mixed";

  if (isMixed) {
    return prisma.question.findMany({
      select: { id: true },
    });
  }

  const categoryRows = await prisma.question.findMany({
    where: {
      category: {
        equals: category,
        mode: "insensitive",
      },
    },
    select: { id: true },
  });

  if (categoryRows.length > 0) return categoryRows;

  return prisma.question.findMany({
    select: { id: true },
  });
}

async function getAttemptRows({
  userId,
  category,
}: {
  userId: string;
  category?: string;
}) {
  const isMixed = !category || category === "mixed";

  return prisma.attempt.findMany({
    where: {
      session: {
        userId,
      },
      ...(isMixed
        ? {}
        : {
            question: {
              category: {
                equals: category,
                mode: "insensitive",
              },
            },
          }),
    },
    select: {
      questionId: true,
      isCorrect: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 800,
  });
}

async function buildSmartQuestionSet({
  userId,
  category,
  count,
}: {
  userId: string | null;
  category?: string;
  count: number;
}) {
  const pool = await getQuestionPool(category);
  const poolIds = pool.map((q) => q.id);

  if (poolIds.length === 0) return [];

  if (!userId) {
    return shuffle(poolIds).slice(0, count);
  }

  const attempts = await getAttemptRows({
    userId,
    category,
  });

  const summaryMap = buildAttemptSummary(attempts);
  const attemptedIds = uniqueIds(
    attempts
      .map((attempt) => attempt.questionId)
      .filter((id): id is string => Boolean(id))
  );

  const poolIdSet = new Set(poolIds);

  const attemptedPriorityIds = attemptedIds
    .filter((id) => poolIdSet.has(id))
    .map((id) => {
      const summary = summaryMap.get(id);

      return {
        id,
        score: summary ? scoreAttemptedQuestion(summary) : 0,
      };
    })
    .filter((item) => item.score > -2)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.id);

  const unattemptedIds = shuffle(poolIds.filter((id) => !summaryMap.has(id)));

  const reviewedButLowerPriorityIds = shuffle(
    poolIds.filter((id) => {
      const summary = summaryMap.get(id);
      if (!summary) return false;

      const age = daysSince(summary.lastAttemptedAt);

      return summary.lastIsCorrect === true && age >= 7;
    })
  );

  const selected = takeUnique(
    [
      ...attemptedPriorityIds,
      ...unattemptedIds,
      ...reviewedButLowerPriorityIds,
    ],
    count
  );

  if (selected.length >= count) return selected;

  const fallbackRows = await prisma.question.findMany({
    where: {
      id: {
        notIn: selected,
      },
    },
    select: { id: true },
  });

  return takeUnique(
    [...selected, ...shuffle(fallbackRows.map((q) => q.id))],
    count
  );
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

    const dbUserId = await getDbUserId(clerkUserId);

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
        questionIds = await buildSmartQuestionSet({
          userId: dbUserId,
          category: "mixed",
          count,
        });

        if (questionIds.length < count) {
          questionIds = await pickRandom57Ids();
        }
      } else {
        questionIds = await buildSmartQuestionSet({
          userId: dbUserId,
          category: "mixed",
          count,
        });
      }
    } else {
      questionIds = await buildSmartQuestionSet({
        userId: dbUserId,
        category,
        count,
      });
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
        : category !== undefined && category !== "mixed"
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
