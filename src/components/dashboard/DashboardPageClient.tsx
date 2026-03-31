"use client";

import * as React from "react";
import { DashboardShell } from "./DashboardShell";
import type {
  DashboardData,
  CategoryStat,
  ExamResult,
  ActivityItem,
} from "./types";

type ServerAttempt = {
  sessionId: string;
  category: string | null;
  isCorrect: boolean | null;
  flagged: boolean;
  timeSpentSec: number | null;
  createdAt: string | Date | null;
};

type ServerSession = {
  id: string;
  label: string | null;
  examKey: string | null;
  minutes: number | null;
  scoreCorrect: number | null;
  scoreTotal: number | null;
  startedAt: string | Date | null;
  submittedAt: string | Date | null;
};

type DashboardServerData = {
  user?: {
    name?: string | null;
    imageUrl?: string | null;
  };
  attempts: ServerAttempt[];
  sessions: ServerSession[];
};

function toNYYYYYMMDD(date?: string | Date | null) {
  if (!date) return "0000-01-01";

  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "0000-01-01";

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);

  const year = parts.find((p) => p.type === "year")?.value ?? "0000";
  const month = parts.find((p) => p.type === "month")?.value ?? "01";
  const day = parts.find((p) => p.type === "day")?.value ?? "01";

  return `${year}-${month}-${day}`;
}

function safeTime(date?: string | Date | null) {
  if (!date) return 0;

  const parsed = new Date(date).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

export default function DashboardPageClient({
  serverData,
}: {
  serverData: DashboardServerData;
}) {
  const attempts = Array.isArray(serverData.attempts)
    ? serverData.attempts
    : [];
  const sessions = Array.isArray(serverData.sessions)
    ? serverData.sessions
    : [];

  const questionsAnswered = attempts.length;
  const totalCorrect = attempts.reduce(
    (n, a) => n + (a.isCorrect === true ? 1 : 0),
    0
  );
  const accuracy = questionsAnswered ? totalCorrect / questionsAnswered : 0;

  const submittedSessions = [...sessions]
    .filter((s) => Boolean(s.submittedAt))
    .sort((a, b) => safeTime(b.submittedAt) - safeTime(a.submittedAt));

  const minutesRecent3 = submittedSessions
    .slice(0, 3)
    .reduce((sum, s) => sum + (s.minutes ?? 0), 0);

  const now = new Date();
  const todayNY = toNYYYYYMMDD(now);

  const daysWithActivity = new Set(
    attempts.map((a) => toNYYYYYMMDD(a.createdAt))
  );

  let streakDays = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = toNYYYYYMMDD(d);

    if (i === 0) {
      if (daysWithActivity.has(todayNY)) {
        streakDays++;
      } else {
        break;
      }
    } else if (daysWithActivity.has(key)) {
      streakDays++;
    } else {
      break;
    }
  }

  const catMap = new Map<string, { correct: number; attempted: number }>();

  for (const a of attempts) {
    const cat = (a.category ?? "Uncategorized").trim() || "Uncategorized";
    const row = catMap.get(cat) ?? { correct: 0, attempted: 0 };
    row.attempted += 1;
    if (a.isCorrect === true) row.correct += 1;
    catMap.set(cat, row);
  }

  const categoryStats: CategoryStat[] = Array.from(catMap.entries())
    .map(([category, { correct, attempted }]) => ({
      category,
      attempted,
      correct,
      accuracy: attempted ? correct / attempted : 0,
    }))
    .sort((a, b) => a.category.localeCompare(b.category));

  const attemptsBySession = new Map<
    string,
    { flagged: number; timeSpentSec: number }
  >();

  for (const a of attempts) {
    const row = attemptsBySession.get(a.sessionId) ?? {
      flagged: 0,
      timeSpentSec: 0,
    };

    if (a.flagged) row.flagged += 1;
    row.timeSpentSec += a.timeSpentSec ?? 0;
    attemptsBySession.set(a.sessionId, row);
  }

  const recentExams: ExamResult[] = submittedSessions.map((s) => {
    const agg = attemptsBySession.get(s.id) ?? {
      flagged: 0,
      timeSpentSec: 0,
    };

    const minutesSpent = Math.max(
      s.minutes ?? 0,
      Math.round((agg.timeSpentSec ?? 0) / 60)
    );

    const scoreRaw = s.scoreCorrect ?? 0;
    const acc = s.scoreTotal ? (s.scoreCorrect ?? 0) / s.scoreTotal : 0;
    const wrongCount = Math.max(0, (s.scoreTotal ?? 0) - (s.scoreCorrect ?? 0));
    const flaggedCount = agg.flagged;
    const mode: ExamResult["mode"] = s.scoreTotal === 57 ? "Full 57" : "Custom";

    return {
      id: s.id,
      dateISO: toNYYYYYMMDD(s.submittedAt ?? s.startedAt),
      mode,
      label: s.label ?? undefined,
      minutesSpent,
      scoreRaw,
      accuracy: acc,
      wrongCount,
      flaggedCount,
    };
  });

  const activity: ActivityItem[] = [...sessions]
    .sort(
      (a, b) =>
        safeTime(b.submittedAt ?? b.startedAt) -
        safeTime(a.submittedAt ?? a.startedAt)
    )
    .slice(0, 8)
    .map((s) => ({
      id: s.id,
      type: "exam",
      title: s.submittedAt
        ? `Submitted ${s.label ?? s.examKey ?? "exam"} • ${
            s.scoreCorrect ?? 0
          }/${s.scoreTotal ?? 0}`
        : `Started ${s.label ?? s.examKey ?? "exam"}`,
      dateISO: toNYYYYYMMDD(s.submittedAt ?? s.startedAt),
      meta: undefined,
    }));

  const data: DashboardData = {
    totals: {
      questionsAnswered,
      accuracy,
      minutes: minutesRecent3,
      streakDays,
    },
    categoryStats,
    recentExams,
    activity,
  };

  return <DashboardShell data={data} isLoading={false} />;
}
