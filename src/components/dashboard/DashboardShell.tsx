"use client";

import React from "react";
import { motion } from "framer-motion";
import { BookCheck, Clock3, Sparkles, Target } from "lucide-react";
import { useUser } from "@clerk/nextjs";

import type { DashboardData } from "./types";
import { pct, minutesToHMM } from "./utils";
import { KPI } from "./KPI";
import { RecentExamsTable } from "./RecentExamsTable";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { ContinueActiveExams } from "./ContinueActiveExams";
import { WeakAreaImprovementPlan } from "./WeakAreaImprovementPlan";

export function DashboardShell({
  data,
  isLoading = false,
  onStartPlanSession,
  isStartingPlanSession = false,
  completedPlanSessions = 0,
}: {
  data: DashboardData;
  isLoading?: boolean;
  onStartPlanSession: (
    category: string,
    count?: number,
    minutes?: number
  ) => void;
  isStartingPlanSession?: boolean;
  completedPlanSessions?: number;
}) {
  const { user } = useUser();
  const username = user?.firstName ?? "there";
  const submittedSessions = data.recentExams.length;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40">
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex w-full flex-col gap-6">
          <section className="relative overflow-hidden rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
            <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/70 to-indigo-50/60" />
            <div className="absolute -left-16 top-0 h-40 w-40 rounded-full bg-indigo-200/20 blur-3xl" />
            <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-violet-200/20 blur-3xl" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-200/60 to-transparent" />

            <div className="relative flex min-w-0 items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-500 to-fuchsia-500 text-white shadow-[0_12px_24px_rgba(99,102,241,0.25)]">
                <Sparkles className="h-5 w-5 text-white" />
              </div>

              <div className="min-w-0">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                  Welcome back, {username} 👋
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-[15px]">
                  Track your real progress, review completed exams, and keep
                  building stronger SHSAT performance with focused next-step
                  practice.
                </p>
              </div>
            </div>
          </section>

          <ContinueActiveExams />

          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
          >
            <KPI
              label="Overall accuracy"
              value={`${pct(data.totals.accuracy)}%`}
              sub="Across completed sessions"
              icon={<Target className="h-4 w-4 text-violet-600" />}
              tone="violet"
            />

            <KPI
              label="Study time"
              value={minutesToHMM(data.totals.minutes)}
              sub="Actual time spent"
              icon={<Clock3 className="h-4 w-4 text-fuchsia-500" />}
              tone="fuchsia"
            />

            <KPI
              label="Sessions completed"
              value={String(submittedSessions)}
              sub="Finished practice exams"
              icon={<BookCheck className="h-4 w-4 text-indigo-600" />}
              tone="indigo"
            />
          </motion.section>

          <section>
            <RecentExamsTable exams={data.recentExams} />
          </section>

          <section>
            <WeakAreaImprovementPlan
              categories={data.categoryStats}
              recentExams={data.recentExams}
              onStartPlanSession={onStartPlanSession}
              isStartingPlanSession={isStartingPlanSession}
              completedPlanSessions={completedPlanSessions}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
