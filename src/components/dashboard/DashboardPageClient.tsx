"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { DashboardShell } from "./DashboardShell";
import type {
  DashboardData,
  CategoryStat,
  ExamResult,
  ActivityItem,
} from "./types";

type CategoryBreakdownItem = {
  total?: number;
  correct?: number;
  flagged?: number;
  accuracy?: number;
};

type ServerSession = {
  id: string;
  label: string | null;
  examKey: string | null;
  mode: string;
  startedAt: string | Date;
  submittedAt: string | Date | null;
  scoreCorrect: number;
  scoreTotal: number;
  minutes: number;
  flagsCount: number;
  progressCount: number;
  categoryBreakdown: unknown;
};

type DashboardServerData = {
  user?: {
    name?: string | null;
    imageUrl?: string | null;
  };
  sessions: ServerSession[];
};

function safeTime(date?: string | Date | null) {
  if (!date) return 0;
  const t = new Date(date).getTime();
  return Number.isNaN(t) ? 0 : t;
}

function toISO(date?: string | Date | null) {
  if (!date) return "0000-01-01";
  const d = new Date(date);
  return d.toISOString().slice(0, 10);
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function normalizeBreakdown(
  value: unknown
): Record<string, CategoryBreakdownItem> {
  if (!isRecord(value)) return {};

  const out: Record<string, CategoryBreakdownItem> = {};

  for (const [k, v] of Object.entries(value)) {
    if (!isRecord(v)) continue;

    out[k] = {
      total: typeof v.total === "number" ? v.total : 0,
      correct: typeof v.correct === "number" ? v.correct : 0,
      flagged: typeof v.flagged === "number" ? v.flagged : 0,
      accuracy: typeof v.accuracy === "number" ? v.accuracy : 0,
    };
  }

  return out;
}

function inferMode(s: ServerSession): ExamResult["mode"] {
  if ((s.scoreTotal ?? 0) === 57) return "Full 57";

  const text = `${s.mode} ${s.label ?? ""} ${s.examKey ?? ""}`.toLowerCase();

  if (text.includes("topic")) return "By Category";
  if (text.includes("practice")) return "By Category";
  if (text.includes("diagnostic")) return "Custom";

  return "Custom";
}

export default function DashboardPageClient({
  serverData,
}: {
  serverData: DashboardServerData;
}) {
  const router = useRouter();
  const [isStartingSession, setIsStartingSession] = React.useState(false);

  const sessions = Array.isArray(serverData.sessions)
    ? serverData.sessions
    : [];

  const submittedSessions = [...sessions]
    .filter((s) => Boolean(s.submittedAt))
    .sort((a, b) => safeTime(b.submittedAt) - safeTime(a.submittedAt));

  const totalCorrect = submittedSessions.reduce(
    (sum, s) => sum + (s.scoreCorrect ?? 0),
    0
  );

  const totalQuestions = submittedSessions.reduce(
    (sum, s) => sum + (s.scoreTotal ?? 0),
    0
  );

  const accuracy = totalQuestions ? totalCorrect / totalQuestions : 0;

  const totalMinutes = submittedSessions.reduce(
    (sum, s) => sum + (s.minutes ?? 0),
    0
  );

  const categoryMap = new Map<string, { attempted: number; correct: number }>();

  for (const session of submittedSessions) {
    const breakdown = normalizeBreakdown(session.categoryBreakdown);

    for (const [category, stat] of Object.entries(breakdown)) {
      const row = categoryMap.get(category) ?? {
        attempted: 0,
        correct: 0,
      };

      row.attempted += stat.total ?? 0;
      row.correct += stat.correct ?? 0;

      categoryMap.set(category, row);
    }
  }

  const categoryStats: CategoryStat[] = Array.from(categoryMap.entries())
    .map(([category, v]) => ({
      category,
      attempted: v.attempted,
      correct: v.correct,
      accuracy: v.attempted ? v.correct / v.attempted : 0,
    }))
    .sort((a, b) => {
      if (a.accuracy !== b.accuracy) return a.accuracy - b.accuracy;
      return b.attempted - a.attempted;
    });

  const recentExams: ExamResult[] = submittedSessions.map((s) => {
    const scoreRaw = s.scoreCorrect ?? 0;
    const total = s.scoreTotal ?? 0;

    return {
      id: s.id,
      dateISO: toISO(s.submittedAt ?? s.startedAt),
      mode: inferMode(s),
      label: s.label ?? undefined,
      minutesSpent: s.minutes ?? 0,
      scoreRaw,
      accuracy: total ? scoreRaw / total : 0,
      wrongCount: Math.max(0, total - scoreRaw),
      flaggedCount: s.flagsCount ?? 0,
    };
  });

  const activity: ActivityItem[] = sessions.slice(0, 8).map((s) => ({
    id: s.id,
    type: "exam",
    title: s.submittedAt
      ? `Submitted ${s.label ?? "exam"} • ${s.scoreCorrect}/${s.scoreTotal}`
      : `Started ${s.label ?? "exam"}`,
    dateISO: toISO(s.submittedAt ?? s.startedAt),
    meta: undefined,
  }));

  const data: DashboardData = {
    totals: {
      questionsAnswered: totalQuestions,
      accuracy,
      minutes: totalMinutes,
      streakDays: 0,
    },
    categoryStats,
    recentExams,
    activity,
  };

  async function handleStartPlanSession(
    category: string,
    count?: number,
    minutes?: number
  ) {
    if (isStartingSession) return;

    try {
      setIsStartingSession(true);

      const finalCount = Math.max(1, count ?? 10);
      const finalMinutes = Math.max(1, minutes ?? 15);

      const res = await fetch("/api/sessions/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: "practice",
          category,
          count: finalCount,
          minutes: finalMinutes,
        }),
      });

      const payload = (await res.json().catch(() => null)) as {
        sessionId?: string;
        id?: string;
        error?: string;
      } | null;

      if (!res.ok) {
        throw new Error(payload?.error || "Failed to start session");
      }

      const sessionId = payload?.sessionId ?? payload?.id;

      if (!sessionId) {
        throw new Error("Session started but no session id was returned");
      }

      router.push(`/session/${sessionId}?from=dashboard`);
      router.refresh();
    } catch (error) {
      console.error("Failed to start dashboard plan session:", error);
      alert("Could not start the session. Please try again.");
    } finally {
      setIsStartingSession(false);
    }
  }

  return (
    <DashboardShell
      data={data}
      isLoading={false}
      onStartPlanSession={handleStartPlanSession}
      isStartingPlanSession={isStartingSession}
    />
  );
}
