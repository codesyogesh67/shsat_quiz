"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  Brain,
  CheckCircle2,
  CircleAlert,
  ClipboardList,
  Flag,
  LineChart,
  RefreshCw,
  Sparkles,
  Target,
} from "lucide-react";

import type { SessionResultsData } from "@/types/exam";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type DiagnosticResultsClientProps = {
  sessionId: string;
  results: SessionResultsData;
};

const CATEGORY_THEME: Record<
  string,
  {
    iconBg: string;
    iconColor: string;
    surface: string;
    progress: string;
    badge: string;
  }
> = {
  Algebra: {
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-700",
    surface:
      "bg-gradient-to-br from-indigo-50 via-white to-violet-50 border-indigo-100/70",
    progress: "from-indigo-500 to-violet-500",
    badge: "bg-indigo-100 text-indigo-700",
  },
  Arithmetic: {
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-700",
    surface:
      "bg-gradient-to-br from-emerald-50 via-white to-teal-50 border-emerald-100/70",
    progress: "from-emerald-500 to-teal-500",
    badge: "bg-emerald-100 text-emerald-700",
  },
  Geometry: {
    iconBg: "bg-amber-100",
    iconColor: "text-amber-700",
    surface:
      "bg-gradient-to-br from-amber-50 via-white to-orange-50 border-amber-100/70",
    progress: "from-amber-500 to-orange-500",
    badge: "bg-amber-100 text-amber-700",
  },
  "Probability and Statistics": {
    iconBg: "bg-fuchsia-100",
    iconColor: "text-fuchsia-700",
    surface:
      "bg-gradient-to-br from-fuchsia-50 via-white to-pink-50 border-fuchsia-100/70",
    progress: "from-fuchsia-500 to-pink-500",
    badge: "bg-fuchsia-100 text-fuchsia-700",
  },
  Uncategorized: {
    iconBg: "bg-slate-100",
    iconColor: "text-slate-700",
    surface:
      "bg-gradient-to-br from-slate-50 via-white to-slate-100 border-slate-200/70",
    progress: "from-slate-500 to-slate-600",
    badge: "bg-slate-100 text-slate-700",
  },
};

function getTheme(category: string) {
  return CATEGORY_THEME[category] ?? CATEGORY_THEME.Uncategorized;
}

function getReadiness(score: number) {
  if (score >= 85) {
    return {
      label: "Strong Position",
      description:
        "You’re performing at a very solid level. Focus on maintaining accuracy and tightening weak areas.",
      tone: "bg-emerald-50 text-emerald-700 border-emerald-200/70",
    };
  }

  if (score >= 70) {
    return {
      label: "Competitive",
      description:
        "You have a good base. A targeted review of mistakes can lift your score quickly.",
      tone: "bg-indigo-50 text-indigo-700 border-indigo-200/70",
    };
  }

  if (score >= 55) {
    return {
      label: "Developing",
      description:
        "Your foundation is building, but there are clear gaps to strengthen before full exam confidence.",
      tone: "bg-amber-50 text-amber-700 border-amber-200/70",
    };
  }

  return {
    label: "Needs Attention",
    description:
      "Start with fundamentals, then move into timed practice. Accuracy improvement should be the first priority.",
    tone: "bg-rose-50 text-rose-700 border-rose-200/70",
  };
}

function getPriorityFocus(results: SessionResultsData) {
  const entries = Object.entries(results.byCategory);

  if (!entries.length) {
    return {
      weakestCategory: "Mixed Practice",
      weakestAccuracy: 0,
    };
  }

  const sorted = [...entries].sort((a, b) => a[1].accuracy - b[1].accuracy);
  const [weakestCategory, weakestData] = sorted[0];

  return {
    weakestCategory,
    weakestAccuracy: weakestData.accuracy,
  };
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  tone = "default",
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  const toneMap = {
    default:
      "bg-gradient-to-br from-slate-50 via-white to-indigo-50/60 border-slate-200/70",
    success:
      "bg-gradient-to-br from-emerald-50 via-white to-teal-50 border-emerald-100/80",
    warning:
      "bg-gradient-to-br from-amber-50 via-white to-orange-50 border-amber-100/80",
    danger:
      "bg-gradient-to-br from-rose-50 via-white to-pink-50 border-rose-100/80",
  };

  const iconToneMap = {
    default: "bg-slate-900 text-white",
    success: "bg-emerald-600 text-white",
    warning: "bg-amber-500 text-white",
    danger: "bg-rose-500 text-white",
  };

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-[24px] border p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5",
        toneMap[tone]
      )}
    >
      <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-white/50 blur-2xl" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
          <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
        </div>

        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-2xl shadow-sm",
            iconToneMap[tone]
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export default function DiagnosticResultsClient({
  sessionId,
  results,
}: DiagnosticResultsClientProps) {
  const readiness = getReadiness(results.score);
  const priority = getPriorityFocus(results);

  const categoryEntries = Object.entries(results.byCategory).sort(
    (a, b) => a[1].accuracy - b[1].accuracy
  );

  const flaggedCount = results.perQuestion.filter((q) => q.flagged).length;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-indigo-50/40">
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="space-y-6">
          <section className="relative overflow-hidden rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-sm sm:p-7">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.12),transparent_30%),radial-gradient(circle_at_left,rgba(217,70,239,0.08),transparent_28%)]" />
            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-gradient-to-br from-indigo-600 via-violet-500 to-fuchsia-500 text-white shadow-sm">
                  <ClipboardList className="h-6 w-6" />
                </div>

                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold tracking-wide text-indigo-700">
                      Diagnostic Report
                    </span>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold tracking-wide text-slate-600">
                      {results.total} Questions
                    </span>
                  </div>

                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    Your SHSAT diagnostic snapshot
                  </h1>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
                    This report shows your current performance level, category
                    breakdown, and the clearest next area to improve.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:w-auto">
                <div className="rounded-[20px] border border-slate-200/70 bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Score
                  </p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {results.score}%
                  </p>
                </div>

                <div className="rounded-[20px] border border-slate-200/70 bg-gradient-to-br from-indigo-50 via-white to-violet-50 px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Accuracy
                  </p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {results.accuracy}%
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Correct"
              value={results.correct}
              subtitle="Questions answered correctly"
              icon={CheckCircle2}
              tone="success"
            />
            <StatCard
              title="Wrong"
              value={results.wrong}
              subtitle="Questions needing review"
              icon={CircleAlert}
              tone="danger"
            />
            <StatCard
              title="Unanswered"
              value={results.unanswered}
              subtitle="Missed due to time or uncertainty"
              icon={RefreshCw}
              tone="warning"
            />
            <StatCard
              title="Flagged"
              value={flaggedCount}
              subtitle="Questions marked for attention"
              icon={Flag}
            />
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.45fr)_380px]">
            <div className="rounded-[28px] border border-slate-200/70 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                    <LineChart className="h-3.5 w-3.5" />
                    Category Performance
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900">
                    Performance by topic
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Focus first on your weakest topic, then reinforce the rest
                    with mixed practice.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {categoryEntries.map(([category, value]) => {
                  const theme = getTheme(category);

                  return (
                    <div
                      key={category}
                      className={cn(
                        "group rounded-[24px] border p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5",
                        theme.surface
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "flex h-10 w-10 items-center justify-center rounded-2xl",
                              theme.iconBg,
                              theme.iconColor
                            )}
                          >
                            <Brain className="h-4.5 w-4.5" />
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {category}
                            </p>
                            <p className="text-xs text-slate-500">
                              {value.correct}/{value.total} correct
                            </p>
                          </div>
                        </div>

                        <span
                          className={cn(
                            "rounded-full px-2.5 py-1 text-xs font-semibold",
                            theme.badge
                          )}
                        >
                          {value.accuracy}%
                        </span>
                      </div>

                      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/80">
                        <div
                          className={cn(
                            "h-full rounded-full bg-gradient-to-r transition-all duration-500",
                            theme.progress
                          )}
                          style={{ width: `${value.accuracy}%` }}
                        />
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                        <div className="rounded-2xl bg-white/70 px-3 py-2 text-slate-600">
                          <span className="block text-[11px] uppercase tracking-wide text-slate-400">
                            Correct
                          </span>
                          <span className="mt-1 block font-semibold text-slate-900">
                            {value.correct}
                          </span>
                        </div>
                        <div className="rounded-2xl bg-white/70 px-3 py-2 text-slate-600">
                          <span className="block text-[11px] uppercase tracking-wide text-slate-400">
                            Wrong
                          </span>
                          <span className="mt-1 block font-semibold text-slate-900">
                            {value.wrong}
                          </span>
                        </div>
                        <div className="rounded-2xl bg-white/70 px-3 py-2 text-slate-600">
                          <span className="block text-[11px] uppercase tracking-wide text-slate-400">
                            Blank
                          </span>
                          <span className="mt-1 block font-semibold text-slate-900">
                            {value.unanswered}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200/70 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex h-full flex-col">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-500 to-fuchsia-500 text-white shadow-sm">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Summary & Next Step
                    </p>
                    <p className="text-xs text-slate-500">
                      Clear guidance based on this diagnostic
                    </p>
                  </div>
                </div>

                <div
                  className={cn("rounded-[24px] border p-4", readiness.tone)}
                >
                  <p className="text-sm font-semibold">{readiness.label}</p>
                  <p className="mt-2 text-sm leading-6">
                    {readiness.description}
                  </p>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="rounded-[22px] border border-slate-200/70 bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <Target className="h-4 w-4 text-indigo-600" />
                      Priority Focus
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Start with{" "}
                      <span className="font-semibold text-slate-900">
                        {priority.weakestCategory}
                      </span>{" "}
                      first. Current accuracy is{" "}
                      <span className="font-semibold text-slate-900">
                        {priority.weakestAccuracy}%
                      </span>
                      .
                    </p>
                  </div>

                  <div className="rounded-[22px] border border-slate-200/70 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <BookOpenCheck className="h-4 w-4 text-indigo-600" />
                      Suggested Plan
                    </div>
                    <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-600">
                      <li>Review mistakes from this diagnostic first.</li>
                      <li>Practice your weakest category in focused sets.</li>
                      <li>Return to mixed practice after topic review.</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 grid gap-3">
                  <Button
                    asChild
                    className="h-11 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-500 to-fuchsia-500 text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:opacity-95"
                  >
                    <Link href={`/diagnostic/${sessionId}/review`}>
                      Review mistakes
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="h-11 rounded-2xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  >
                    <Link href="/practice">Practice weak areas</Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="h-11 rounded-2xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  >
                    <Link href="/diagnostic">Take another diagnostic</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
