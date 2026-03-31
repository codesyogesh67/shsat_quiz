"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ReportComponentProps, TopicStatus } from "@/types/diagnostic";
import {
  ArrowRight,
  BarChart3,
  Clock3,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.45,
      ease: "easeOut" as const,
    },
  }),
};

const statusTone: Record<
  TopicStatus,
  { badge: string; bar: string; iconWrap: string }
> = {
  Strong: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    bar: "from-emerald-500 to-teal-500",
    iconWrap: "bg-emerald-50 text-emerald-600",
  },
  Good: {
    badge: "bg-sky-50 text-sky-700 border-sky-200",
    bar: "from-sky-500 to-indigo-500",
    iconWrap: "bg-sky-50 text-sky-600",
  },
  "Needs Work": {
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    bar: "from-amber-500 to-orange-500",
    iconWrap: "bg-amber-50 text-amber-600",
  },
  Priority: {
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    bar: "from-rose-500 to-pink-500",
    iconWrap: "bg-rose-50 text-rose-600",
  },
};

function highlightSummary(text: string, highlights: string[]) {
  let result = text;

  highlights.forEach((word) => {
    const regex = new RegExp(`(${word})`, "gi");
    result = result.replace(
      regex,
      `<span class="font-semibold text-indigo-600">$1</span>`
    );
  });

  return result;
}

export default function DiagnosticResultsDashboard({
  report,
}: ReportComponentProps) {
  const recommendedParam = encodeURIComponent(report.weakTopics.join(","));

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
        <div className="space-y-6">
          {/* Hero / Report Card */}
          {/* Hero / Report Card */}
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="relative overflow-hidden"
          >
            <div className="relative p-6 md:p-8 ">
              <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr] ">
                {/* Left side */}
                {/* bg-gradient-to-br from-indigo-100 to-violet-100 rounded-lg shadow-xl */}
                {/* bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(248,250,252,0.96))]  */}
                <div className="rounded-[28px] border border-slate-200/70 p-6 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-lg shadow-xl">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                      SHSAT Guide
                    </span>

                    <span className="inline-flex items-center rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-1 text-xs font-medium text-white shadow-md shadow-indigo-500/20">
                      Diagnostic Report
                    </span>
                  </div>

                  <div className="mt-6 grid gap-6 md:grid-cols-[1fr_auto] md:items-start">
                    <div>
                      <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
                        Student Snapshot
                      </p>

                      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
                        Your math report card
                      </h1>

                      <div className="mt-5 rounded-2xl border border-indigo-100 bg-gradient-to-r from-white to-indigo-50/70 p-4">
                        <p
                          className="max-w-2xl text-[15px] leading-7 text-slate-700 md:text-base"
                          dangerouslySetInnerHTML={{
                            __html: highlightSummary(report.summary, [
                              ...(report.weakTopics || []),
                              report.strongestTopic?.topic || "",
                            ]),
                          }}
                        />
                      </div>
                    </div>

                    <div className="shrink-0">
                      <div className="rounded-[28px] bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 px-6 py-6 text-white shadow-[0_18px_40px_-18px_rgba(49,46,129,0.65)]">
                        <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/60">
                          Overall Accuracy
                        </p>

                        <div className="mt-4 flex items-end gap-2">
                          <span className="text-5xl font-semibold tracking-tight">
                            {report.accuracy}
                          </span>
                          <span className="pb-1 text-lg font-medium text-white/70">
                            %
                          </span>
                        </div>

                        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400"
                            style={{ width: `${report.accuracy}%` }}
                          />
                        </div>

                        <p className="mt-3 text-sm text-white/70">
                          {report.scoreCorrect} of {report.scoreTotal} questions
                          correct
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Readiness
                      </p>
                      <p className="mt-2 text-lg font-semibold text-slate-900">
                        {report.readinessLevel}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Time Spent
                      </p>
                      <p className="mt-2 text-lg font-semibold text-slate-900">
                        {report.totalTimeMin} min
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Daily Goal
                      </p>
                      <p className="mt-2 text-lg font-semibold text-slate-900">
                        {report.recommendedDailyMinutes} min
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right side */}
                <div className="grid gap-4">
                  <div className="rounded-[28px] border border-emerald-200/70 bg-[linear-gradient(135deg,rgba(236,253,245,0.95),rgba(255,255,255,0.96))] p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-emerald-700/80">
                          Strongest Topic
                        </p>
                        <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
                          {report.strongestTopic?.topic ?? "Not enough data"}
                        </h2>
                        <p className="mt-2 text-sm text-slate-600">
                          {report.strongestTopic
                            ? `${report.strongestTopic.correct}/${report.strongestTopic.total} correct`
                            : "Complete more work to reveal strengths"}
                        </p>
                      </div>

                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-rose-200/70 bg-[linear-gradient(135deg,rgba(255,241,242,0.96),rgba(255,255,255,0.96))] p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-rose-700/80">
                          Priority Focus
                        </p>
                        <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
                          {report.weakestTopic?.topic ?? "Not enough data"}
                        </h2>
                        <p className="mt-2 text-sm text-slate-600">
                          {report.weakestTopic
                            ? `${report.weakestTopic.correct}/${report.weakestTopic.total} correct`
                            : "Complete more work to reveal gaps"}
                        </p>
                      </div>

                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
                        <TrendingDown className="h-5 w-5" />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-slate-100 bg-slate-200 p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-md font-semibold uppercase tracking-wide text-slate-900">
                          Priority Focus
                        </p>
                        <p className="mt-3 text-sm leading-7 text-slate-700">
                          Focus first on{" "}
                          <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text font-semibold text-transparent">
                            {report.weakTopics.join(", ")}
                          </span>{" "}
                          and keep stronger areas active with short review sets.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Topic Performance */}
          <section className="rounded-[32px] border border-slate-200/70 bg-white/90 p-6 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.18)] backdrop-blur-sm md:p-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Topic Breakdown
                </p>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                  Performance by category
                </h2>
              </div>
              <p className="max-w-md text-sm text-slate-500">
                Use this breakdown to identify where to review, where to drill,
                and where you can move faster.
              </p>
            </div>

            <div className="mt-6 space-y-4">
              {report.topicStats.map((stat, i) => {
                const tone = statusTone[stat.status];

                return (
                  <motion.div
                    key={stat.topic}
                    custom={i}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="group rounded-[28px] border border-slate-200/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(248,250,252,0.96))] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_30px_-20px_rgba(99,102,241,0.30)]"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone.iconWrap}`}
                          >
                            <BarChart3 className="h-5 w-5" />
                          </div>

                          <div>
                            <h3 className="text-base font-semibold text-slate-900">
                              {stat.topic}
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                              {stat.correct} correct out of {stat.total}{" "}
                              questions
                            </p>
                          </div>

                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${tone.badge}`}
                          >
                            {stat.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-end gap-4 md:text-right">
                        <div>
                          <p className="text-3xl font-semibold tracking-tight text-slate-900">
                            {stat.accuracy}%
                          </p>
                          <p className="text-xs text-slate-500">accuracy</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5">
                      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                        <motion.div
                          className={`h-full rounded-full bg-gradient-to-r ${tone.bar}`}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${stat.accuracy}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.55, delay: i * 0.04 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
          {/* <ImprovementPlanPreview report={report} /> */}
          {/* <ImprovementPlanAccordion report={report} /> */}

          {/* Improvement Plan */}
          <section className="rounded-[32px] border border-slate-200/70 bg-white/90 p-6 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.18)] backdrop-blur-sm md:p-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Improvement Plan
                </p>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                  Your next steps from this diagnostic
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                  A sharper roadmap based on your weak topics, current
                  readiness, and the areas where you can improve fastest.
                </p>
              </div>

              <Link
                href={`/diagnostic/plan/${report.sessionId}`}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-all duration-200 hover:opacity-95"
              >
                View full plan
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-4">
              <div className="rounded-[28px] border border-indigo-200/70 bg-[linear-gradient(135deg,rgba(238,242,255,0.95),rgba(255,255,255,0.98))] p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-indigo-700/80">
                      Today
                    </p>
                    <h3 className="mt-3 text-base font-semibold leading-6 text-slate-900">
                      Start with {report.weakTopics[0] ?? "your priority topic"}
                    </h3>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                    <Target className="h-5 w-5" />
                  </div>
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Practice {report.weakTopics[0] ?? "your weakest topic"} for{" "}
                  {report.recommendedDailyMinutes} minutes and review every
                  mistake before moving on.
                </p>
              </div>

              <div className="rounded-[28px] border border-violet-200/70 bg-[linear-gradient(135deg,rgba(245,243,255,0.96),rgba(255,255,255,0.98))] p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-violet-700/80">
                      This Week
                    </p>
                    <h3 className="mt-3 text-base font-semibold leading-6 text-slate-900">
                      Build accuracy first
                    </h3>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm">
                    <Clock3 className="h-5 w-5" />
                  </div>
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Focus on {report.weakTopics.slice(0, 2).join(" + ")} and slow
                  down your solving so you can reduce repeated mistakes.
                </p>
              </div>

              <div className="rounded-[28px] border border-fuchsia-200/70 bg-[linear-gradient(135deg,rgba(253,244,255,0.96),rgba(255,255,255,0.98))] p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-fuchsia-700/80">
                      This Month
                    </p>
                    <h3 className="mt-3 text-base font-semibold leading-6 text-slate-900">
                      Strengthen weak areas
                    </h3>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-fuchsia-600 shadow-sm">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Build consistency across{" "}
                  {report.weakTopics.slice(0, 3).join(", ")} and keep your
                  strongest topic active with short review sessions.
                </p>
              </div>

              <div className="rounded-[28px] bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 p-5 text-white shadow-[0_20px_40px_-20px_rgba(49,46,129,0.60)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/60">
                      3-Month Goal
                    </p>
                    <h3 className="mt-3 text-base font-semibold leading-6 text-white">
                      Reach balanced readiness
                    </h3>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </div>

                <p className="mt-3 text-sm leading-6 text-white/75">
                  Reduce weak spots, improve pacing, and move toward stronger
                  overall SHSAT confidence across categories.
                </p>

                <Link
                  href={`/diagnostic/plan/${report.sessionId}`}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-white/15"
                >
                  Open full roadmap
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>

          {/* Actions */}
          <section className="rounded-[32px] bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 p-[1px] shadow-[0_24px_60px_-28px_rgba(79,70,229,0.45)]">
            <div className="rounded-[31px] bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(49,46,129,0.92))] p-6 md:p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm font-medium text-white/60">
                    Next Action
                  </p>
                  <h2 className="text-2xl font-semibold tracking-tight text-white">
                    Continue your progress
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-white/75">
                    Start with weak-topic practice, then move into mixed review
                    to build confidence, pacing, and better topic balance.
                  </p>
                </div>
                <div className="grid w-full gap-3 sm:w-auto sm:min-w-[420px]">
                  <Link
                    href={`/practice?mode=practice&recommended=${recommendedParam}`}
                    className="group inline-flex items-center justify-between rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all duration-200 hover:opacity-95 hover:-translate-y-0.5"
                  >
                    <span className="flex flex-col text-left">
                      <span>Start weak-topic practice</span>
                      <span className="mt-1 text-xs font-medium text-white">
                        Best next step from this report
                      </span>
                    </span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </Link>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <Link
                      href="/practice"
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm font-semibold text-white/90 transition-all duration-200 hover:bg-white/10"
                    >
                      <span className="block">Practice by topic</span>
                      <span className="mt-1 block text-xs font-medium text-white/55">
                        Choose any category
                      </span>
                    </Link>

                    <Link
                      href={`/review/${report.sessionId}`}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm font-semibold text-white/90 transition-all duration-200 hover:bg-white/10"
                    >
                      <span className="block">Review questions</span>
                      <span className="mt-1 block text-xs font-medium text-white/55">
                        Revisit this diagnostic
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
