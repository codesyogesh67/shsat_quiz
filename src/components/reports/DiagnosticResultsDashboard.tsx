"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ReportComponentProps, TopicStatus } from "@/types/diagnostic";
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  Clock3,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
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
  {
    badge: string;
    bar: string;
    iconWrap: string;
    card: string;
  }
> = {
  Strong: {
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    bar: "from-emerald-500 to-teal-500",
    iconWrap: "bg-emerald-100 text-emerald-700",
    card: "from-emerald-50 via-white to-teal-50/70",
  },
  Good: {
    badge: "border-sky-200 bg-sky-50 text-sky-700",
    bar: "from-sky-500 to-indigo-500",
    iconWrap: "bg-sky-100 text-sky-700",
    card: "from-sky-50 via-white to-indigo-50/70",
  },
  "Needs Work": {
    badge: "border-amber-200 bg-amber-50 text-amber-700",
    bar: "from-amber-500 to-orange-500",
    iconWrap: "bg-amber-100 text-amber-700",
    card: "from-amber-50 via-white to-orange-50/70",
  },
  Priority: {
    badge: "border-rose-200 bg-rose-50 text-rose-700",
    bar: "from-rose-500 to-pink-500",
    iconWrap: "bg-rose-100 text-rose-700",
    card: "from-rose-50 via-white to-pink-50/70",
  },
};

function highlightSummary(text: string, highlights: string[]) {
  let result = text;

  highlights.forEach((word) => {
    if (!word) return;
    const regex = new RegExp(`(${word})`, "gi");
    result = result.replace(
      regex,
      `<span class="font-semibold text-indigo-600">$1</span>`
    );
  });

  return result;
}

function SectionHeader({
  icon: Icon,
  eyebrow,
  title,
  description,
  badge,
}: {
  icon: React.ComponentType<{ className?: string }>;
  eyebrow: string;
  title: string;
  description?: string;
  badge?: string;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-500 to-fuchsia-500 text-white shadow-[0_10px_24px_-12px_rgba(99,102,241,0.55)]">
          <Icon className="h-5 w-5 text-white" />
        </div>

        <div>
          <p className="text-sm font-medium text-slate-500">{eyebrow}</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            {title}
          </h2>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              {description}
            </p>
          ) : null}
        </div>
      </div>

      {badge ? (
        <div className="inline-flex items-center rounded-full border border-slate-200/70 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
          {badge}
        </div>
      ) : null}
    </div>
  );
}

function StatCard({
  label,
  value,
  helper,
  accent,
}: {
  label: string;
  value: string;
  helper: string;
  accent: "indigo" | "violet" | "emerald" | "slate";
}) {
  const styles = {
    indigo:
      "from-indigo-50 via-white to-violet-50/80 border-indigo-200/60 text-indigo-700",
    violet:
      "from-violet-50 via-white to-fuchsia-50/80 border-violet-200/60 text-violet-700",
    emerald:
      "from-emerald-50 via-white to-teal-50/80 border-emerald-200/60 text-emerald-700",
    slate:
      "from-slate-50 via-white to-slate-100/80 border-slate-200/70 text-slate-700",
  }[accent];

  return (
    <div
      className={`rounded-[24px] border bg-gradient-to-br p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_30px_-24px_rgba(15,23,42,0.18)] ${styles}`}
    >
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
        {value}
      </p>
      <p className="mt-2 text-sm text-slate-600">{helper}</p>
    </div>
  );
}

export default function DiagnosticResultsDashboard({
  report,
}: ReportComponentProps) {
  const recommendedParam = encodeURIComponent(report.weakTopics.join(","));
  const strongestTopic = report.strongestTopic?.topic ?? "Not enough data";
  const weakestTopic = report.weakestTopic?.topic ?? "Not enough data";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40">
      <main className="w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="space-y-6">
          {/* Hero */}
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="relative overflow-hidden rounded-[32px] border border-slate-200/70 bg-white shadow-[0_24px_60px_-36px_rgba(15,23,42,0.22)]"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.14),transparent_28%),radial-gradient(circle_at_top_right,rgba(217,70,239,0.12),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(129,140,248,0.10),transparent_26%)]" />
            <div className="pointer-events-none absolute -top-16 right-10 h-40 w-40 rounded-full bg-violet-300/20 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 left-8 h-32 w-32 rounded-full bg-indigo-300/20 blur-3xl" />

            <div className="relative p-5 sm:p-6 lg:p-7">
              <div className="grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
                {/* Left */}
                <div className="rounded-[28px] border border-slate-200/70 bg-gradient-to-br from-indigo-50 via-white to-violet-50/70 p-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center rounded-full border border-slate-200/70 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
                      SHSAT Guide
                    </span>
                    <span className="inline-flex items-center rounded-full bg-gradient-to-r from-indigo-600 via-violet-500 to-fuchsia-500 px-3 py-1 text-xs font-semibold text-white shadow-[0_10px_24px_-12px_rgba(99,102,241,0.45)]">
                      Diagnostic Report
                    </span>
                  </div>

                  <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_auto]">
                    <div>
                      <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
                        Student Snapshot
                      </p>

                      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
                        Your math report card
                      </h1>

                      <div className="mt-5 rounded-[24px] border border-indigo-100/80 bg-white/85 p-4 shadow-sm">
                        <p
                          className="max-w-3xl text-[15px] leading-7 text-slate-700 md:text-base"
                          dangerouslySetInnerHTML={{
                            __html: highlightSummary(report.summary, [
                              ...(report.weakTopics || []),
                              report.strongestTopic?.topic || "",
                            ]),
                          }}
                        />
                      </div>
                    </div>

                    <div className="min-w-[240px]">
                      <div className="rounded-[28px] bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 p-6 text-white shadow-[0_20px_50px_-24px_rgba(49,46,129,0.65)]">
                        <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/60">
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

                  <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                      label="Readiness"
                      value={report.readinessLevel}
                      helper="Current diagnostic level"
                      accent="indigo"
                    />
                    <StatCard
                      label="Time Spent"
                      value={`${report.totalTimeMin} min`}
                      helper="Total test session time"
                      accent="violet"
                    />
                    <StatCard
                      label="Daily Goal"
                      value={`${report.recommendedDailyMinutes} min`}
                      helper="Suggested daily study target"
                      accent="emerald"
                    />
                    <StatCard
                      label="Correct Answers"
                      value={`${report.scoreCorrect}/${report.scoreTotal}`}
                      helper="Current score snapshot"
                      accent="slate"
                    />
                  </div>
                </div>

                {/* Right */}
                <div className="grid gap-4">
                  <div className="rounded-[28px] border border-emerald-200/70 bg-gradient-to-br from-emerald-50 via-white to-teal-50/70 p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_30px_-24px_rgba(16,185,129,0.22)]">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-700/80">
                          Strongest Topic
                        </p>
                        <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
                          {strongestTopic}
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

                  <div className="rounded-[28px] border border-rose-200/70 bg-gradient-to-br from-rose-50 via-white to-pink-50/70 p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_30px_-24px_rgba(244,63,94,0.20)]">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-[0.16em] text-rose-700/80">
                          Priority Focus
                        </p>
                        <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
                          {weakestTopic}
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

                  <div className="rounded-[28px] border border-slate-200/70 bg-gradient-to-br from-slate-50 via-white to-indigo-50/50 p-5 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
                        <Sparkles className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          Focus Direction
                        </p>
                        <p className="mt-2 text-sm leading-7 text-slate-600">
                          Focus first on{" "}
                          <span className="bg-gradient-to-r from-indigo-600 via-violet-500 to-fuchsia-500 bg-clip-text font-semibold text-transparent">
                            {report.weakTopics.join(", ")}
                          </span>{" "}
                          and keep stronger areas active with short review sets.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-slate-200/70 bg-white p-5 shadow-sm">
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                      Best Next Move
                    </p>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      Start with targeted practice on your weakest topic, then
                      review mistakes from this diagnostic before doing mixed
                      review.
                    </p>

                    <Link
                      href={`/practice?mode=practice&recommended=${recommendedParam}`}
                      className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-500 to-fuchsia-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_-18px_rgba(99,102,241,0.48)] transition-all duration-300 hover:-translate-y-0.5 hover:opacity-95"
                    >
                      Start weak-topic practice
                      <ArrowRight className="h-4 w-4 text-white" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Topic Breakdown */}
          <section className="rounded-[32px] border border-slate-200/70 bg-white p-5 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.18)] sm:p-6 lg:p-7">
            <SectionHeader
              icon={BarChart3}
              eyebrow="Topic Breakdown"
              title="Performance by category"
              description="Use this breakdown to see where you should review more carefully, where to build repetition, and where you can move faster with confidence."
              badge={`${report.topicStats.length} categories`}
            />

            <div className="mt-6 grid gap-4 xl:grid-cols-2">
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
                    className={`group rounded-[28px] border border-slate-200/70 bg-gradient-to-br ${tone.card} p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_34px_-24px_rgba(99,102,241,0.28)]`}
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <div
                            className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tone.iconWrap}`}
                          >
                            <BarChart3 className="h-5 w-5" />
                          </div>

                          <div className="min-w-0">
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

                      <div className="md:text-right">
                        <p className="text-3xl font-semibold tracking-tight text-slate-900">
                          {stat.accuracy}%
                        </p>
                        <p className="text-xs text-slate-500">accuracy</p>
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

          {/* Improvement Plan */}
          <section className="rounded-[32px] border border-slate-200/70 bg-white p-5 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.18)] sm:p-6 lg:p-7">
            <SectionHeader
              icon={BookOpenCheck}
              eyebrow="Improvement Plan"
              title="Your next steps from this diagnostic"
              description="A sharper roadmap based on your weak topics, current readiness, and the areas where you can improve fastest."
            />

            <div className="mt-6 grid gap-4 xl:grid-cols-4">
              <div className="rounded-[28px] border border-indigo-200/70 bg-gradient-to-br from-indigo-50 via-white to-violet-50/70 p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5">
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

              <div className="rounded-[28px] border border-violet-200/70 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50/70 p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5">
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

              <div className="rounded-[28px] border border-fuchsia-200/70 bg-gradient-to-br from-fuchsia-50 via-white to-pink-50/70 p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5">
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

              <div className="rounded-[28px] bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 p-5 text-white shadow-[0_20px_40px_-20px_rgba(49,46,129,0.60)] transition-all duration-300 hover:-translate-y-0.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/60">
                      3-Month Goal
                    </p>
                    <h3 className="mt-3 text-base font-semibold leading-6 text-white">
                      Reach balanced readiness
                    </h3>
                  </div>
                </div>

                <p className="mt-3 text-sm leading-6 text-white/75">
                  Reduce weak spots, improve pacing, and move toward stronger
                  overall SHSAT confidence across categories.
                </p>

                <Link
                  href={`/diagnostic/plan/${report.sessionId}`}
                  className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/15"
                >
                  Open full roadmap
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>

          {/* Unified Summary + CTA */}
          <section className="rounded-[32px] border border-slate-200/70 bg-white p-5 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.18)] sm:p-6 lg:p-7">
            <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[28px] border border-slate-200/70 bg-gradient-to-br from-slate-50 via-white to-indigo-50/60 p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-500 to-fuchsia-500 text-white shadow-[0_10px_24px_-12px_rgba(99,102,241,0.55)]">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Session Summary
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
                      What this report is telling you
                    </h2>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      You should spend the most time improving{" "}
                      <span className="font-semibold text-slate-900">
                        {report.weakTopics.join(", ")}
                      </span>
                      , while keeping{" "}
                      <span className="font-semibold text-slate-900">
                        {strongestTopic}
                      </span>{" "}
                      active with short review so you do not lose momentum in a
                      stronger area.
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[22px] border border-slate-200/70 bg-white p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Focus First
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {report.weakTopics[0] ?? weakestTopic}
                    </p>
                  </div>

                  <div className="rounded-[22px] border border-slate-200/70 bg-white p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Review Mistakes
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      Before mixed practice
                    </p>
                  </div>

                  <div className="rounded-[22px] border border-slate-200/70 bg-white p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Daily Study Goal
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {report.recommendedDailyMinutes} minutes
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 p-5 text-white shadow-[0_24px_60px_-30px_rgba(79,70,229,0.45)]">
                <p className="text-sm font-medium text-white/60">Next Action</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white">
                  Continue your progress
                </h2>
                <p className="mt-2 text-sm leading-7 text-white/75">
                  Start with weak-topic practice, then review mistakes from this
                  diagnostic, and finally move into mixed practice to build
                  confidence and pacing.
                </p>

                <div className="mt-6 space-y-3">
                  <Link
                    href={`/practice?mode=practice&recommended=${recommendedParam}`}
                    className="group inline-flex w-full items-center justify-between rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-500 to-fuchsia-500 px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:opacity-95"
                  >
                    <span className="flex flex-col text-left">
                      <span>Start weak-topic practice</span>
                      <span className="mt-1 text-xs font-medium text-white/85">
                        Best next step from this report
                      </span>
                    </span>
                    <ArrowRight className="text-white h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </Link>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <Link
                      href={`/review/${report.sessionId}`}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm font-semibold text-white/90 transition-all duration-300 hover:bg-white/10"
                    >
                      <span className="block">Review mistakes</span>
                      <span className="mt-1 block text-xs font-medium text-white/55">
                        Revisit this diagnostic
                      </span>
                    </Link>

                    <Link
                      href="/practice"
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm font-semibold text-white/90 transition-all duration-300 hover:bg-white/10"
                    >
                      <span className="block">Practice by topic</span>
                      <span className="mt-1 block text-xs font-medium text-white/55">
                        Choose any category
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
