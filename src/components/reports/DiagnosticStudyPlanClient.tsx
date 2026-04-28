"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { WeakAreaImprovementPlan } from "@/components/dashboard/WeakAreaImprovementPlan";
import type { DashboardData, ExamResult } from "@/components/dashboard/types";

type DiagnosticTopicStat = {
  topic: string;
  total: number;
  correct: number;
  accuracy: number;
};

type Props = {
  topicStats: DiagnosticTopicStat[];
  sessionId: string;
};

export default function DiagnosticStudyPlanClient({
  topicStats,
  sessionId,
}: Props) {
  const router = useRouter();
  const [isStarting, setIsStarting] = React.useState(false);

  const categories: DashboardData["categoryStats"] = topicStats.map(
    (topic) => ({
      category: topic.topic,
      attempted: topic.total,
      correct: topic.correct,
      accuracy: topic.accuracy / 100,
    })
  );

  const recentExams: ExamResult[] = [];

  async function handleStartPlanSession(
    category: string,
    count?: number,
    minutes?: number
  ) {
    if (isStarting) return;

    try {
      setIsStarting(true);

      const res = await fetch("/api/sessions/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: category && category !== "mixed" ? "topic" : "practice",
          category: category && category !== "mixed" ? category : undefined,
          count: count ?? 10,
          minutes: minutes ?? 12,
          sourceSessionId: sessionId,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.ok || !data?.sessionId) {
        throw new Error(data?.error || "Could not start session");
      }

      router.push(`/session/${data.sessionId}?from=diagnostic-roadmap`);
    } catch (error) {
      console.error("Failed to start diagnostic roadmap session:", error);
      alert("Could not start the session. Please try again.");
    } finally {
      setIsStarting(false);
    }
  }

  return (
    <WeakAreaImprovementPlan
      categories={categories}
      recentExams={recentExams}
      onStartPlanSession={handleStartPlanSession}
      isStartingPlanSession={isStarting}
    />
  );
}
