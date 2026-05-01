"use client";

import Link from "next/link";
import {
  AlertTriangle,
  BarChart3,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Layers3,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Target,
  ArrowRight,
} from "lucide-react";

import { cn } from "@/lib/utils";

type DiagnosticTopicStat = {
  topic: string;
  total: number;
  correct: number;
  accuracy: number;
};

type Props = {
  topicStats: DiagnosticTopicStat[];
  recommendedDailyMinutes: number;
};

function getWeekPlan(priorityTopic: string, secondTopic?: string) {
  return [
    {
      week: "Week 1",
      title: `Rebuild ${priorityTopic}`,
      goal: "Build accuracy before speed.",
      description:
        "Start with untimed practice. Write every solving step clearly. After each mistake, redo the problem without looking at the answer and write one reason why the mistake happened.",
      tasks: [
        "Complete 3 short focused sessions",
        "Review every missed question",
        "Write down repeated mistake patterns",
      ],
      icon: Target,
    },
    {
      week: "Week 2",
      title: secondTopic ? `Add ${secondTopic}` : "Add the next weak area",
      goal: "Improve topic recognition.",
      description:
        "Keep reviewing the first weak area, but begin adding the second priority topic. The student should learn when to use each method, not just memorize steps.",
      tasks: [
        "Practice both weak areas",
        "Compare similar question types",
        "Start light timing after accuracy improves",
      ],
      icon: Layers3,
    },
    {
      week: "Week 3",
      title: "Move into mixed practice",
      goal: "Build flexibility under pressure.",
      description:
        "Mix weak topics with stronger topics. This helps the student switch methods, avoid careless errors, and prepare for the real SHSAT format.",
      tasks: [
        "Complete mixed topic sessions",
        "Track careless vs concept mistakes",
        "Review timing on each question",
      ],
      icon: BookOpenCheck,
    },
    {
      week: "Week 4",
      title: "Retest and adjust",
      goal: "Measure real improvement.",
      description:
        "Use a timed session or diagnostic-style review to compare progress. The next plan should be updated only after enough new practice data is collected.",
      tasks: [
        "Complete one timed review session",
        "Compare topic accuracy",
        "Update the next improvement plan",
      ],
      icon: RotateCcw,
    },
  ];
}

function getTopicTheme(index: number) {
  const themes = [
    {
      icon: Target,
      card: "border-indigo-200 bg-indigo-50/70",
      iconBox: "bg-indigo-600 text-white",
      bar: "from-indigo-600 to-violet-500",
    },
    {
      icon: Layers3,
      card: "border-violet-200 bg-violet-50/60",
      iconBox: "bg-violet-600 text-white",
      bar: "from-violet-600 to-fuchsia-500",
    },
    {
      icon: BarChart3,
      card: "border-amber-200 bg-amber-50/60",
      iconBox: "bg-amber-500 text-white",
      bar: "from-amber-500 to-orange-500",
    },
    {
      icon: CheckCircle2,
      card: "border-emerald-200 bg-emerald-50/60",
      iconBox: "bg-emerald-600 text-white",
      bar: "from-emerald-500 to-cyan-500",
    },
  ];

  return themes[index % themes.length];
}

function getPriorityLabel(accuracy: number) {
  if (accuracy < 50) return "Rebuild";
  if (accuracy < 70) return "Improve";
  return "Maintain";
}

function getPriorityIcon(accuracy: number) {
  if (accuracy < 70) return AlertTriangle;
  return CheckCircle2;
}

export default function DiagnosticStudyPlanClient({
  topicStats,
  recommendedDailyMinutes,
}: Props) {
  const sortedStats = [...topicStats].sort((a, b) => a.accuracy - b.accuracy);
  const priorityTopic = sortedStats[0]?.topic ?? "your weakest topic";
  const secondTopic = sortedStats[1]?.topic;
  const weekPlan = getWeekPlan(priorityTopic, secondTopic);

  if (!topicStats.length) {
    return (
      <section className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-slate-900">
          Roadmap unavailable
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Complete a diagnostic first so your roadmap can be built from real
          performance data.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <div className="overflow-hidden rounded-[30px] border border-slate-200/70 bg-white shadow-[0_20px_80px_-48px_rgba(79,70,229,0.35)]">
          <div className="border-b border-slate-200/70 bg-gradient-to-br from-white via-slate-50 to-indigo-50/50 p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 app-icon-filled">
                <CalendarDays className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                  Detailed 30-day roadmap
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  This plan gives the student a clear month-long path: rebuild
                  weak areas, mix skills, then retest with better habits.
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-200/70">
            {weekPlan.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.week} className="p-5 sm:p-6">
                  <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
                    <div>
                      <span className="inline-flex rounded-full border border-slate-200/70 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                        {item.week}
                      </span>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700">
                        <Icon className="h-5 w-5" />
                      </div>

                      <div>
                        <h3 className="text-base font-semibold text-slate-950">
                          {item.title}
                        </h3>

                        <p className="mt-1 text-sm font-medium text-indigo-700">
                          {item.goal}
                        </p>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {item.description}
                        </p>

                        <div className="mt-4 grid gap-2 sm:grid-cols-3">
                          {item.tasks.map((task) => (
                            <div
                              key={task}
                              className="rounded-2xl bg-slate-50 px-3 py-2 text-xs font-medium leading-5 text-slate-600 ring-1 ring-slate-200/70"
                            >
                              {task}
                            </div>
                          ))}
                        </div>

                        {item.week === "Week 1" ? (
                          <p className="mt-4 rounded-2xl bg-indigo-50 px-4 py-3 text-sm leading-6 text-indigo-900">
                            Recommended pace:{" "}
                            <span className="font-semibold">
                              {recommendedDailyMinutes} minutes per day
                            </span>
                            . Keep practice short enough to review mistakes
                            carefully.
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="rounded-[30px] border border-slate-200/70 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-slate-950">
              Topic priority
            </h2>

            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100">
              Weakest first
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {sortedStats.map((stat, index) => {
              const theme = getTopicTheme(index);
              const Icon = theme.icon;
              const PriorityIcon = getPriorityIcon(stat.accuracy);

              return (
                <div
                  key={stat.topic}
                  className={cn("rounded-[22px] border p-4", theme.card)}
                >
                  <div className="flex gap-3">
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl app-icon-filled",
                        theme.iconBox
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-950">
                            {stat.topic}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-500">
                            {stat.correct}/{stat.total} correct
                          </p>
                        </div>

                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200/70">
                          <PriorityIcon className="h-3 w-3" />
                          {getPriorityLabel(stat.accuracy)}
                        </span>
                      </div>

                      <div className="mt-3">
                        <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                          <span>Accuracy</span>
                          <span>{Math.round(stat.accuracy)}%</span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-white/90">
                          <div
                            className={cn(
                              "h-full rounded-full bg-gradient-to-r",
                              theme.bar
                            )}
                            style={{
                              width: `${Math.max(
                                4,
                                Math.min(100, stat.accuracy)
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 rounded-2xl border border-indigo-200 bg-indigo-50/70 p-4">
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-indigo-700" />
              <p className="text-sm leading-6 text-indigo-900/80">
                This order gives parents and students a clear reason for what to
                study first.
              </p>
            </div>
          </div>
        </aside>
      </div>

      <div className="relative overflow-hidden rounded-[30px] border border-indigo-200 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-500 p-6 text-white shadow-[0_24px_80px_-40px_rgba(79,70,229,0.65)]">
        <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 h-44 w-44 rounded-full bg-white/10 blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/20">
              <Sparkles className="h-3.5 w-3.5 text-white" />
              Keep the plan updated
            </div>

            <h2 className="text-2xl font-semibold tracking-tight">
              Turn this roadmap into a tracked improvement plan
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/80">
              Sign in and start a free trial to track completed sessions, update
              weak areas after progress, and keep the student moving toward a
              stronger SHSAT score with a premium improvement plan.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-indigo-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-indigo-50"
            >
              Try free for 7 days
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-2xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/15"
            >
              View premium
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
