// components/dashboard/DashboardPageClient.tsx
"use client";

import * as React from "react";
import { DashboardShell } from "./DashboardShell";
import type { DashboardServerData } from "@/app/dashboard/page";
import type {
  DashboardData,
  CategoryStat,
  ExamResult,
  ActivityItem,
} from "./types";

function toDateISO(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.toISOString().slice(0, 10);
}

export default function DashboardPageClient({
  serverData,
}: {
  serverData: DashboardServerData;
}) {
  // ---- totals ----
  const questionsAnswered = serverData.attempts.length;
  const totalCorrect = serverData.attempts.reduce(
    (n, a) => n + (a.isCorrect ? 1 : 0),
    0
  );
  const accuracy = questionsAnswered ? totalCorrect / questionsAnswered : 0;

  // minutes = sum of last 3 *submitted* sessions' minutes OR from attempts time (fallback)
  const submitted = serverData.sessions.filter((s) => !!s.submittedAt);
  const minutesRecent3 = submitted
    .slice(0, 3)
    .reduce((sum, s) => sum + (s.minutes ?? 0), 0);

  // streak days based on attempts (activity by day)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysWithActivity = new Set(
    serverData.attempts.map((a) => toDateISO(a.createdAt))
  );
  let streakDays = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (daysWithActivity.has(d.toISOString().slice(0, 10))) streakDays++;
    else break;
  }

  // ---- category stats ----
  const catMap = new Map<string, { correct: number; attempted: number }>();
  for (const a of serverData.attempts) {
    const cat = (a.category ?? "Uncategorized").trim() || "Uncategorized";
    const row = catMap.get(cat) ?? { correct: 0, attempted: 0 };
    row.attempted += 1;
    if (a.isCorrect) row.correct += 1;
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

  // ---- recent exams table ----
  const attemptsBySession = new Map<
    string,
    { flagged: number; timeSpentSec: number }
  >();
  for (const a of serverData.attempts) {
    const row = attemptsBySession.get(a.sessionId) ?? {
      flagged: 0,
      timeSpentSec: 0,
    };
    if (a.flagged) row.flagged += 1;
    row.timeSpentSec += a.timeSpentSec ?? 0;
    attemptsBySession.set(a.sessionId, row);
  }

  const recentExams: ExamResult[] = serverData.sessions
    // ✅ only completed exams
    .filter((s) => !!s.submittedAt)
    // optional: show newest submitted first
    .sort((a, b) => {
      const ad = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
      const bd = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
      return bd - ad;
    })
    .map((s) => {
      const agg = attemptsBySession.get(s.id) ?? {
        flagged: 0,
        timeSpentSec: 0,
      };
      const minutesSpent = Math.max(
        s.minutes ?? 0,
        Math.round((agg.timeSpentSec ?? 0) / 60)
      );
      const scoreRaw = s.scoreCorrect ?? 0;
      const accuracy = s.scoreTotal ? (s.scoreCorrect ?? 0) / s.scoreTotal : 0;
      const wrongCount = (s.scoreTotal ?? 0) - (s.scoreCorrect ?? 0);
      const flaggedCount = agg.flagged;

      const mode: ExamResult["mode"] =
        s.scoreTotal === 57 ? "Full 57" : "Custom";

      return {
        id: s.id,
        dateISO: toDateISO(s.submittedAt ?? s.startedAt),
        mode,
        label: s.examKey ?? undefined,
        minutesSpent,
        scoreRaw,
        accuracy,
        wrongCount,
        flaggedCount,
      };
    });

  // ---- activity feed (simple: from sessions) ----
  const activity: ActivityItem[] = serverData.sessions.slice(0, 8).map((s) => ({
    id: s.id,
    type: "exam",
    title: s.submittedAt
      ? `Submitted ${s.examKey ?? "exam"} • ${s.scoreCorrect}/${s.scoreTotal}`
      : `Started ${s.examKey ?? "exam"}`,
    dateISO: toDateISO(s.submittedAt ?? s.startedAt),
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
