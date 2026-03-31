"use client";

import React from "react";
import { motion } from "framer-motion";
import { BarChart3, Clock3, Flame, Target } from "lucide-react";
import { useUser } from "@clerk/nextjs";

import type { DashboardData } from "./types";
import { pct, minutesToHMM } from "./utils";
import { KPI } from "./KPI";
import { RecentExamsTable } from "./RecentExamsTable";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { ContinueActiveExams } from "./ContinueActiveExams";
import { TopicFocusList } from "./TopicFocusList";
import { DashboardHero } from "./DashboardHero";

export function DashboardShell({
  data,
  isLoading = false,
}: {
  data: DashboardData;
  isLoading?: boolean;
}) {
  const { user } = useUser();
  const username = user?.firstName ?? "there";

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* <DashboardHero data={data} /> */}

        <div className="mb-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {data.totals.streakDays > 0
              ? `You're on a ${data.totals.streakDays}-day streak 🔥`
              : `Welcome back, ${username} 👋`}
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            {data.totals.streakDays > 0
              ? "Keep the momentum going — one more session today."
              : "Start a session to begin building your progress."}
          </p>
        </div>

        <ContinueActiveExams />

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          <KPI
            label="Questions answered"
            value={String(data.totals.questionsAnswered)}
            sub="Across submitted practice"
            icon={<BarChart3 className="h-4 w-4 text-indigo-600" />}
            tone="indigo"
          />

          <KPI
            label="Overall accuracy"
            value={`${pct(data.totals.accuracy)}%`}
            sub="Performance snapshot"
            icon={<Target className="h-4 w-4 text-violet-600" />}
            tone="violet"
          />

          <KPI
            label="Study time"
            value={minutesToHMM(data.totals.minutes)}
            sub="Total tracked practice"
            icon={<Clock3 className="h-4 w-4 text-fuchsia-500" />}
            tone="fuchsia"
          />

          <KPI
            label="Current streak"
            value={`${data.totals.streakDays} day${
              data.totals.streakDays === 1 ? "" : "s"
            }`}
            sub="Keep momentum alive"
            icon={<Flame className="h-4 w-4 text-orange-500" />}
            tone="orange"
          />
        </motion.section>

        <section>
          <TopicFocusList categories={data.categoryStats} />
        </section>

        <RecentExamsTable exams={data.recentExams} />

        <section className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-sm">
          <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="p-6 sm:p-8">
              <div className="inline-flex rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
                Premium preview
              </div>

              <h3 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
                Upgrade for smarter guidance after every exam
              </h3>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
                Turn mistakes into next-step study actions with deeper feedback,
                targeted explanations, and better weekly direction.
              </p>

              <div className="mt-5 grid gap-3 text-sm text-slate-600">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                  Step-by-step explanations for missed questions
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                  Adaptive practice sets from weak categories
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                  Personalized study planning based on performance trends
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-500 p-6 sm:p-8">
              <div className="w-full max-w-sm rounded-3xl bg-white/12 p-5 text-white backdrop-blur-md">
                <p className="text-sm font-medium text-white/80">
                  Coming premium tools
                </p>

                <div className="mt-3 space-y-3">
                  <div className="rounded-2xl bg-white/10 px-4 py-3">
                    AI error analysis
                  </div>
                  <div className="rounded-2xl bg-white/10 px-4 py-3">
                    Similar-question generator
                  </div>
                  <div className="rounded-2xl bg-white/10 px-4 py-3">
                    Weekly progress coaching
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
