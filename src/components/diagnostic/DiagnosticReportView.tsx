"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Brain,
  CalendarDays,
  Clock3,
  Crown,
  Flame,
  Target,
  TrendingUp,
  TriangleAlert,
  Zap,
} from "lucide-react";
import type { DiagnosticReport } from "@/types/diagnostic";

type Props = {
  report: DiagnosticReport;
};

type WeeklyPlanItem = {
  day: string;
  title: string;
  minutes: number;
};

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

function statusStyles(status: string) {
  switch (status) {
    case "Strong":
      return {
        badge: "bg-emerald-500/12 text-emerald-300 ring-emerald-400/25",
        bar: "from-emerald-400 to-emerald-500",
      };
    case "Good":
      return {
        badge: "bg-violet-500/12 text-violet-200 ring-violet-400/25",
        bar: "from-violet-400 to-indigo-500",
      };
    case "Needs Work":
      return {
        badge: "bg-amber-500/12 text-amber-300 ring-amber-400/25",
        bar: "from-amber-400 to-orange-500",
      };
    case "Priority":
      return {
        badge: "bg-rose-500/12 text-rose-300 ring-rose-400/25",
        bar: "from-rose-400 to-fuchsia-500",
      };
    default:
      return {
        badge: "bg-white/10 text-white ring-white/15",
        bar: "from-zinc-400 to-zinc-500",
      };
  }
}

function readinessStyles(level: string) {
  switch (level) {
    case "Strong":
      return "bg-emerald-500/12 text-emerald-300 ring-emerald-400/25";
    case "Competitive":
      return "bg-violet-500/12 text-violet-200 ring-violet-400/25";
    case "Developing":
      return "bg-amber-500/12 text-amber-300 ring-amber-400/25";
    default:
      return "bg-rose-500/12 text-rose-300 ring-rose-400/25";
  }
}

function percentLabel(value: number) {
  if (value >= 80) return "Excellent";
  if (value >= 60) return "On Track";
  if (value >= 40) return "Needs Focus";
  return "Urgent Focus";
}

function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={item}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`rounded-[28px] border border-white/10 bg-white/[0.045] shadow-[0_10px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl ${className}`}
    >
      {children}
    </motion.div>
  );
}

function buildFallbackWeeklyPlan(
  weakTopics: string[],
  recommendedDailyMinutes: number
): WeeklyPlanItem[] {
  const topWeakTopic = weakTopics[0] || "Geometry";
  const secondWeakTopic = weakTopics[1] || "Algebra";
  const dailyMinutes =
    typeof recommendedDailyMinutes === "number" && recommendedDailyMinutes > 0
      ? recommendedDailyMinutes
      : 30;

  return [
    {
      day: "Day 1",
      title: `${topWeakTopic} fundamentals review`,
      minutes: dailyMinutes,
    },
    {
      day: "Day 2",
      title: `${topWeakTopic} focused practice`,
      minutes: dailyMinutes,
    },
    {
      day: "Day 3",
      title: `${secondWeakTopic} concept review`,
      minutes: dailyMinutes,
    },
    {
      day: "Day 4",
      title: `${secondWeakTopic} targeted drills`,
      minutes: dailyMinutes,
    },
    {
      day: "Day 5",
      title: "Review missed questions",
      minutes: dailyMinutes,
    },
    {
      day: "Day 6",
      title: "Timed mixed practice",
      minutes: dailyMinutes,
    },
    {
      day: "Day 7",
      title: "Light review and reset",
      minutes: Math.max(15, Math.round(dailyMinutes * 0.6)),
    },
  ];
}

export default function DiagnosticReportView({ report }: Props) {
  const topWeakTopic =
    report.weakTopics[0] || report.weakestTopic?.topic || "Geometry";
  const secondWeakTopic = report.weakTopics[1] || "Algebra";

  const weeklyPlan: WeeklyPlanItem[] =
    "weeklyPlan" in report &&
    Array.isArray(report.weeklyPlan) &&
    report.weeklyPlan.length > 0
      ? report.weeklyPlan
      : buildFallbackWeeklyPlan(
          report.weakTopics,
          report.recommendedDailyMinutes
        );

  const mindsetLines: string[] =
    "mindset" in report && Array.isArray(report.mindset)
      ? report.mindset
      : [
          "Focus on accuracy before speed this week.",
          "Review your mistakes carefully and look for patterns.",
          "Small daily sessions will help more than one long rushed session.",
        ];

  return (
    <main className="min-h-screen bg-[#080c14] text-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.18),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(79,70,229,0.12),transparent_28%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.015),transparent_30%,transparent_70%,rgba(255,255,255,0.015))]" />

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="relative mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10"
        >
          <div className="space-y-8">
            <GlassCard className="overflow-hidden">
              <div className="grid gap-8 lg:grid-cols-[1.35fr_0.85fr]">
                <div className="relative p-6 md:p-8 lg:p-10">
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(99,102,241,0.16),transparent_40%,rgba(255,255,255,0.03))]" />

                  <div className="relative space-y-6">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-300">
                        <Zap className="h-3.5 w-3.5" />
                        Diagnostic Complete
                      </span>

                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ring-1 ring-inset ${readinessStyles(
                          report.readinessLevel
                        )}`}
                      >
                        {report.readinessLevel}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <h1 className="max-w-3xl text-3xl font-black tracking-tight text-white md:text-5xl">
                        Your SHSAT Report Card
                      </h1>
                      <p className="max-w-2xl text-sm leading-7 text-zinc-300 md:text-base">
                        {report.summary}
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <motion.div
                        whileHover={{ y: -3 }}
                        className="rounded-2xl border border-white/10 bg-black/20 p-4"
                      >
                        <p className="text-xs uppercase tracking-[0.16em] text-zinc-400">
                          Strongest Area
                        </p>
                        <p className="mt-2 text-lg font-bold text-white">
                          {report.strongestTopic?.topic ?? "Arithmetic"}
                        </p>
                      </motion.div>

                      <motion.div
                        whileHover={{ y: -3 }}
                        className="rounded-2xl border border-white/10 bg-black/20 p-4"
                      >
                        <p className="text-xs uppercase tracking-[0.16em] text-zinc-400">
                          Priority Focus
                        </p>
                        <p className="mt-2 text-lg font-bold text-white">
                          {report.weakestTopic?.topic ?? "Geometry"}
                        </p>
                      </motion.div>

                      <motion.div
                        whileHover={{ y: -3 }}
                        className="rounded-2xl border border-white/10 bg-black/20 p-4"
                      >
                        <p className="text-xs uppercase tracking-[0.16em] text-zinc-400">
                          Daily Goal
                        </p>
                        <p className="mt-2 text-lg font-bold text-white">
                          {report.recommendedDailyMinutes}
                        </p>
                      </motion.div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Link
                          href={`/practice?mode=practice&recommended=${encodeURIComponent(
                            report.weakTopics.join(",")
                          )}`}
                          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 px-5 py-3 text-sm font-bold text-white shadow-[0_10px_30px_rgba(99,102,241,0.28)] transition hover:shadow-[0_16px_40px_rgba(99,102,241,0.35)]"
                        >
                          Start Today&apos;s Practice
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Link
                          href={`/practice?mode=practice&recommended=${encodeURIComponent(
                            report.weakTopics.join(",")
                          )}`}
                          className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                        >
                          Practice Weak Topics
                        </Link>
                      </motion.div>
                    </div>
                  </div>
                </div>

                <div className="border-l border-white/10 bg-black/20 p-6 md:p-8">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                    {[
                      {
                        label: "Correct Answers",
                        value: (
                          <>
                            {report.scoreCorrect}
                            <span className="ml-1 text-lg font-semibold text-zinc-400">
                              / {report.scoreTotal}
                            </span>
                          </>
                        ),
                        icon: Target,
                        sub: "",
                      },
                      {
                        label: "Accuracy",
                        value: `${report.accuracy}%`,
                        icon: TrendingUp,
                        sub: percentLabel(report.accuracy),
                      },
                      {
                        label: "Time Spent",
                        value: `${report.totalTimeMin} min`,
                        icon: Clock3,
                        sub: "",
                      },
                      {
                        label: "Next Priority",
                        value: topWeakTopic,
                        icon: Flame,
                        sub: "Best place to gain points this week",
                      },
                    ].map((card, index) => {
                      const Icon = card.icon;
                      const highlighted = index === 3;

                      return (
                        <motion.div
                          key={card.label}
                          whileHover={{ y: -4, scale: 1.015 }}
                          className={`rounded-3xl border p-5 ${
                            highlighted
                              ? "border-violet-400/20 bg-gradient-to-br from-violet-500/18 to-indigo-500/10"
                              : "border-white/10 bg-white/5"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-zinc-400">
                              {card.label}
                            </p>
                            <Icon
                              className={`h-4 w-4 ${
                                highlighted
                                  ? "text-violet-300"
                                  : "text-zinc-500"
                              }`}
                            />
                          </div>
                          <p className="mt-3 text-3xl font-black text-white">
                            {card.value}
                          </p>
                          {card.sub ? (
                            <p className="mt-1 text-sm text-zinc-300">
                              {card.sub}
                            </p>
                          ) : null}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </GlassCard>

            <motion.section
              variants={item}
              className="grid gap-4 lg:grid-cols-3"
            >
              {[
                {
                  title: "Best Skill",
                  value: report.strongestTopic?.topic ?? "Arithmetic",
                  text:
                    "This is where you looked most confident. Keep it strong, but don’t spend most of your week here.",
                  icon: Crown,
                  tone:
                    "border-emerald-400/18 bg-emerald-500/[0.07] text-emerald-300",
                },
                {
                  title: "Biggest Opportunity",
                  value: report.weakestTopic?.topic ?? "Geometry",
                  text:
                    "This is where targeted practice can create the fastest score growth over the next 1–2 weeks.",
                  icon: TriangleAlert,
                  tone: "border-rose-400/18 bg-rose-500/[0.07] text-rose-300",
                },
                {
                  title: "Coaching Advice",
                  value: "Accuracy Before Speed",
                  text:
                    "Slow down on weaker topics, review mistakes carefully, and focus on getting more right before trying to go faster.",
                  icon: Brain,
                  tone:
                    "border-violet-400/18 bg-violet-500/[0.07] text-violet-200",
                },
              ].map((card) => {
                const Icon = card.icon;
                return (
                  <motion.div
                    key={card.title}
                    whileHover={{ y: -4 }}
                    className={`rounded-[28px] border p-6 backdrop-blur ${card.tone}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-white/10 p-3">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-zinc-300">
                          {card.title}
                        </p>
                        <h3 className="text-xl font-black text-white">
                          {card.value}
                        </h3>
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-zinc-300">
                      {card.text}
                    </p>
                  </motion.div>
                );
              })}
            </motion.section>

            <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
              <GlassCard className="p-6 md:p-8">
                <div className="mb-6 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">
                      Report Card
                    </p>
                    <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">
                      Topic Performance
                    </h2>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300">
                    Based on your diagnostic session
                  </div>
                </div>

                <div className="space-y-4">
                  {report.topicStats.map((topic, index) => {
                    const styles = statusStyles(topic.status);

                    return (
                      <motion.div
                        key={topic.topic}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: 0.15 + index * 0.06,
                          duration: 0.35,
                        }}
                        whileHover={{ y: -3 }}
                        className="rounded-3xl border border-white/10 bg-black/20 p-5"
                      >
                        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-white">
                              {topic.topic}
                            </h3>
                            <p className="text-sm text-zinc-400">
                              {topic.correct} correct out of {topic.total}{" "}
                              questions
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-2xl font-black text-white">
                              {topic.accuracy}%
                            </span>
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] ring-1 ring-inset ${styles.badge}`}
                            >
                              {topic.status}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="h-3 overflow-hidden rounded-full bg-white/10">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${topic.accuracy}%` }}
                              transition={{
                                delay: 0.2 + index * 0.08,
                                duration: 0.7,
                                ease: [0.22, 1, 0.36, 1],
                              }}
                              className={`h-full rounded-full bg-gradient-to-r ${styles.bar}`}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-zinc-500">
                            <span>0%</span>
                            <span>Mastery</span>
                            <span>100%</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </GlassCard>

              <GlassCard className="p-6 md:p-8">
                <div className="mb-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">
                    Personalized Plan
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">
                    Your Week 1 Roadmap
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-zinc-300">
                    Follow this sequence to turn your weakest areas into real
                    gains.
                  </p>
                </div>

                <div className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2 xl:grid xl:grid-cols-1 xl:overflow-visible xl:px-0">
                  {weeklyPlan.map((planItem, index) => (
                    <motion.div
                      key={planItem.day}
                      whileHover={{ y: -4 }}
                      className="min-w-[270px] snap-start rounded-3xl border border-white/10 bg-gradient-to-br from-violet-500/10 to-transparent p-4 xl:min-w-0"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-sm font-black text-white">
                          {index + 1}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
                              {planItem.day}
                            </span>
                            <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-zinc-200">
                              {planItem.minutes} min
                            </span>
                          </div>

                          <h3 className="mt-2 text-lg font-bold text-white">
                            {planItem.title}
                          </h3>

                          <p className="mt-1 text-sm text-zinc-300">
                            {planItem.title.toLowerCase().includes("timed")
                              ? "Measure progress under pressure and build pacing."
                              : planItem.title.toLowerCase().includes("review")
                              ? "Slow down, revisit mistakes, and lock in concepts."
                              : planItem.title.toLowerCase().includes("rest")
                              ? "Keep your brain fresh and avoid burnout."
                              : "Focus deeply on this area and aim for cleaner accuracy."}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  whileHover={{ y: -3 }}
                  className="mt-6 rounded-3xl border border-violet-400/18 bg-violet-500/[0.07] p-5"
                >
                  <div className="flex items-center gap-3">
                    <CalendarDays className="h-5 w-5 text-violet-300" />
                    <h3 className="text-lg font-bold text-white">
                      Weekly Strategy
                    </h3>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-zinc-300">
                    Spend most of your time on{" "}
                    <span className="font-semibold text-white">
                      {topWeakTopic}
                    </span>{" "}
                    and{" "}
                    <span className="font-semibold text-white">
                      {secondWeakTopic}
                    </span>
                    . Then end the week with one mixed or timed session to check
                    improvement.
                  </p>
                </motion.div>
              </GlassCard>
            </section>

            <section className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
              <GlassCard className="p-6 md:p-8">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-violet-500/12 p-3 text-violet-200">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">
                      Daily Recommendation
                    </p>
                    <h2 className="mt-1 text-2xl font-black text-white">
                      {report.recommendedDailyMinutes}
                    </h2>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {[
                    {
                      label: "Best use of your time",
                      value: "70% weak-topic practice",
                    },
                    {
                      label: "Focus this week",
                      value: `${topWeakTopic} + ${secondWeakTopic}`,
                    },
                    { label: "Goal", value: "Improve accuracy before speed" },
                  ].map((row) => (
                    <motion.div
                      key={row.label}
                      whileHover={{ x: 4 }}
                      className="rounded-3xl border border-white/10 bg-black/20 p-4"
                    >
                      <p className="text-sm text-zinc-400">{row.label}</p>
                      <p className="mt-2 text-lg font-bold text-white">
                        {row.value}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </GlassCard>

              <GlassCard className="p-6 md:p-8">
                <div className="mb-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">
                    Mental Coaching
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">
                    Mindset for This Week
                  </h2>
                </div>

                <div className="grid gap-3">
                  {mindsetLines.map((line, index) => (
                    <motion.div
                      key={line}
                      whileHover={{
                        y: -2,
                        backgroundColor: "rgba(255,255,255,0.07)",
                      }}
                      className="rounded-3xl border border-white/10 bg-black/20 p-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-sm font-bold text-white">
                          {index + 1}
                        </div>
                        <p className="text-sm leading-7 text-zinc-300">
                          {line}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </GlassCard>
            </section>

            <GlassCard className="bg-gradient-to-r from-violet-500/[0.10] via-transparent to-indigo-500/[0.10] p-6 md:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-300">
                    Next Step
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">
                    Start where your score can improve fastest
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-zinc-300 md:text-base">
                    Begin with{" "}
                    <span className="font-semibold text-white">
                      {topWeakTopic}
                    </span>
                    , then move into{" "}
                    <span className="font-semibold text-white">
                      {secondWeakTopic}
                    </span>
                    . This is the highest-impact path from your diagnostic.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href={`/practice?mode=practice&recommended=${encodeURIComponent(
                        report.weakTopics.join(",")
                      )}`}
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 px-5 py-3 text-sm font-bold text-white shadow-[0_10px_30px_rgba(99,102,241,0.28)]"
                    >
                      Start Today&apos;s Practice
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href="/practice"
                      className="inline-flex items-center rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                    >
                      Practice by Topic
                    </Link>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href={`/diagnostic/${report.sessionId}/review`}
                      className="inline-flex items-center rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                    >
                      Review Diagnostic
                    </Link>
                  </motion.div>
                </div>
              </div>
            </GlassCard>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
