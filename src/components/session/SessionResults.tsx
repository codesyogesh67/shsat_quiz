"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock3,
  Flag,
  RotateCcw,
  Sparkles,
  Target,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ReviewFilter, SessionResultsData } from "@/types/exam";

type Props = {
  title?: string;
  subtitle?: string;
  mode?: "practice" | "diagnostic" | "exam" | "topic";
  results: SessionResultsData;
  flags: Record<string, boolean>;
  onReview: (filter: ReviewFilter) => void;
  onRetake?: () => void;
  onPickAnother?: () => void;
};

function pct(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

function formatModeLabel(mode: Props["mode"]) {
  switch (mode) {
    case "diagnostic":
      return "Diagnostic Session";
    case "exam":
      return "Exam Simulation";
    case "topic":
      return "Topic Practice";
    default:
      return "Practice Session";
  }
}

function getCategoryTheme(key: string) {
  switch (key) {
    case "mixed":
      return {
        icon: Sparkles,
        chip: "bg-white/15 text-white border-white/20",
        card:
          "from-indigo-600 via-violet-500 to-fuchsia-500 text-white border-indigo-400/30",
        lightCard:
          "border-indigo-200 bg-gradient-to-br from-indigo-50 via-violet-50 to-fuchsia-50",
        iconWrap: "bg-indigo-100 text-indigo-700",
        progress: "from-indigo-500 via-violet-500 to-fuchsia-500",
      };
    case "Algebra":
      return {
        icon: Target,
        chip: "bg-indigo-50 text-indigo-700 border-indigo-200",
        card:
          "from-indigo-500 via-indigo-600 to-violet-600 text-white border-indigo-400/30",
        lightCard:
          "border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-violet-50",
        iconWrap: "bg-indigo-100 text-indigo-700",
        progress: "from-indigo-500 via-indigo-600 to-violet-600",
      };
    case "Arithmetic":
      return {
        icon: Sparkles,
        chip: "bg-emerald-50 text-emerald-700 border-emerald-200",
        card:
          "from-emerald-500 via-teal-500 to-cyan-500 text-white border-emerald-400/30",
        lightCard:
          "border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-cyan-50",
        iconWrap: "bg-emerald-100 text-emerald-700",
        progress: "from-emerald-500 via-teal-500 to-cyan-500",
      };
    case "Geometry":
      return {
        icon: BarChart3,
        chip: "bg-amber-50 text-amber-700 border-amber-200",
        card:
          "from-amber-500 via-orange-500 to-rose-500 text-white border-orange-400/30",
        lightCard:
          "border-amber-200 bg-gradient-to-br from-amber-50 via-white to-rose-50",
        iconWrap: "bg-amber-100 text-amber-700",
        progress: "from-amber-500 via-orange-500 to-rose-500",
      };
    case "Probability and Statistics":
      return {
        icon: BarChart3,
        chip: "bg-sky-50 text-sky-700 border-sky-200",
        card:
          "from-sky-500 via-cyan-500 to-blue-500 text-white border-sky-400/30",
        lightCard:
          "border-sky-200 bg-gradient-to-br from-sky-50 via-white to-blue-50",
        iconWrap: "bg-sky-100 text-sky-700",
        progress: "from-sky-500 via-cyan-500 to-blue-500",
      };
    default:
      return {
        icon: BookOpen,
        chip: "bg-slate-50 text-slate-700 border-slate-200",
        card:
          "from-slate-700 via-slate-800 to-slate-900 text-white border-slate-500/30",
        lightCard:
          "border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-100",
        iconWrap: "bg-slate-100 text-slate-700",
        progress: "from-slate-600 via-slate-700 to-slate-800",
      };
  }
}

export default function SessionResults({
  title = "Session Complete",
  subtitle = "Review your performance, revisit mistakes, and continue practicing with focus.",
  mode = "practice",
  results,
  flags,
  onReview,
  onRetake,
  onPickAnother,
}: Props) {
  const total =
    results.total ??
    (results.correct ?? 0) + (results.wrong ?? 0) + (results.unanswered ?? 0);

  const correct = results.correct ?? 0;
  const wrong = results.wrong ?? 0;
  const unanswered = results.unanswered ?? 0;
  const marked = Object.values(flags ?? {}).filter(Boolean).length;
  const score =
    results.score ??
    (total ? Math.round(((results.correct ?? 0) / total) * 100) : 0);

  const categoryEntries = Object.entries(results.byCategory ?? {});
  const modeLabel = formatModeLabel(mode);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-indigo-50/40">
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden rounded-[28px] border border-slate-200/70 bg-white shadow-[0_20px_80px_-40px_rgba(79,70,229,0.35)]"
        >
          <div className="relative overflow-hidden border-b border-indigo-400/20 px-5 py-4 sm:px-6">
            <div className="absolute inset-0" />
            <div className="absolute -right-10 top-0 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -left-6 bottom-0 h-20 w-20 rounded-full bg-fuchsia-400/20 blur-2xl" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.10),transparent_32%),radial-gradient(circle_at_top_right,rgba(217,70,239,0.10),transparent_24%)]" />

            <div className="relative flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                    <CheckCircle2 className="h-4.5 w-4.5" />
                  </span>

                  <h2 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
                    {title}
                  </h2>
                </div>

                <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-indigo-600">
                  <Sparkles className="h-3 w-3" />
                  {modeLabel}
                </div>

                <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/90 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                  <Flag className="h-3 w-3" />
                  {total} questions reviewed
                </div>
              </div>

              <p className="relative mt-0.5 max-w-2xl text-sm text-slate-500">
                {subtitle}
              </p>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="group relative overflow-hidden rounded-[22px] border border-indigo-400/30 bg-gradient-to-br from-indigo-600 via-violet-500 to-fuchsia-500 p-4 text-white shadow-[0_14px_30px_-24px_rgba(79,70,229,0.32)]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_28%)]" />
                  <div className="relative">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/75">
                          Score
                        </p>
                        <p className="mt-2 text-3xl font-extrabold tracking-tight">
                          {score}%
                        </p>
                      </div>
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/20">
                        <Target className="h-5 w-5" />
                      </span>
                    </div>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/20">
                      <div
                        className="h-full rounded-full bg-white"
                        style={{ width: `${score}%` }}
                      />
                    </div>

                    <p className="mt-3 text-xs text-white/80">
                      Overall session performance
                    </p>
                  </div>
                </div>

                <div className="group relative overflow-hidden rounded-[22px] border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-20px_rgba(15,23,42,0.15)]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
                        Correct
                      </p>
                      <p className="mt-2 flex items-center text-3xl font-extrabold tracking-tight text-slate-900">
                        {correct}
                      </p>
                    </div>
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                      <CheckCircle2 className="h-5 w-5" />
                    </span>
                  </div>

                  <p className="mt-3 text-sm font-medium text-slate-600">
                    {pct(correct, total)}% accuracy achieved
                  </p>
                </div>

                <div className="group relative overflow-hidden rounded-[22px] border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-rose-50 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-20px_rgba(15,23,42,0.15)]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-700">
                        Wrong
                      </p>
                      <p className="mt-2 flex items-center text-3xl font-extrabold tracking-tight text-slate-900">
                        {wrong}
                      </p>
                    </div>
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                      <XCircle className="h-5 w-5" />
                    </span>
                  </div>

                  <p className="mt-3 text-sm font-medium text-slate-600">
                    Best section to review next
                  </p>
                </div>

                <div className="group relative overflow-hidden rounded-[22px] border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-blue-50 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-20px_rgba(15,23,42,0.15)]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-700">
                        Unanswered
                      </p>
                      <p className="mt-2 flex items-center text-3xl font-extrabold tracking-tight text-slate-900">
                        {unanswered}
                      </p>
                    </div>
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                      <Clock3 className="h-5 w-5" />
                    </span>
                  </div>

                  <p className="mt-3 text-sm font-medium text-slate-600">
                    Time management opportunity
                  </p>
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_420px]">
                <div className="rounded-[24px] border border-slate-200/70 bg-white p-5 shadow-[0_12px_30px_-28px_rgba(15,23,42,0.22)]">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                      <BarChart3 className="h-5 w-5" />
                    </span>

                    <div>
                      <h3 className="text-base font-semibold text-slate-900">
                        Category Performance
                      </h3>
                      <p className="text-sm text-slate-500">
                        Topic-by-topic breakdown for this session.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {categoryEntries.map(([name, value]) => {
                      let valuePct = 0;

                      if (typeof value === "number") {
                        valuePct = value;
                      } else if (
                        value &&
                        typeof value === "object" &&
                        "accuracy" in value &&
                        typeof value.accuracy === "number"
                      ) {
                        valuePct = value.accuracy;
                      } else if (
                        value &&
                        typeof value === "object" &&
                        "correct" in value &&
                        "total" in value &&
                        typeof value.correct === "number" &&
                        typeof value.total === "number"
                      ) {
                        valuePct =
                          value.total > 0
                            ? Math.round((value.correct / value.total) * 100)
                            : 0;
                      }

                      valuePct = Math.max(0, Math.min(valuePct, 100));
                      const theme = getCategoryTheme(name);
                      const Icon = theme.icon;

                      return (
                        <div
                          key={name}
                          className={cn(
                            "group relative overflow-hidden rounded-[20px] border px-4 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-20px_rgba(15,23,42,0.15)]",
                            theme.lightCard
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span
                                  className={cn(
                                    "flex h-8 w-8 items-center justify-center rounded-xl",
                                    theme.iconWrap
                                  )}
                                >
                                  <Icon className="h-4 w-4" />
                                </span>
                                <h4 className="truncate text-[14px] font-semibold leading-5 text-slate-900">
                                  {name}
                                </h4>
                              </div>

                              <p className="mt-2 text-[12px] leading-4 text-slate-500">
                                Category accuracy
                              </p>
                            </div>

                            <span
                              className={cn(
                                "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                                theme.chip
                              )}
                            >
                              {valuePct}%
                            </span>
                          </div>

                          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/80">
                            <div
                              className={cn(
                                "h-full rounded-full bg-gradient-to-r",
                                theme.progress
                              )}
                              style={{ width: `${valuePct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-[24px] border border-slate-200/70 bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 p-5 shadow-[0_12px_30px_-28px_rgba(79,70,229,0.25)]">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                      <Sparkles className="h-5 w-5" />
                    </span>

                    <div>
                      <h3 className="text-base font-semibold text-slate-900">
                        Session Summary
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Your quick recap plus the best next actions to keep
                        momentum going.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3">
                    <div className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white px-4 py-3">
                      <span className="text-sm text-slate-500">
                        Total Questions
                      </span>
                      <span className="text-sm font-semibold text-slate-900">
                        {total}
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white px-4 py-3">
                      <span className="text-sm text-slate-500">
                        Marked for Review
                      </span>
                      <span className="flex items-center text-sm font-semibold text-slate-900">
                        <Flag className="mr-1.5 h-4 w-4 text-amber-600" />
                        {marked}
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white px-4 py-3">
                      <span className="text-sm text-slate-500">Accuracy</span>
                      <span className="text-sm font-semibold text-slate-900">
                        {pct(correct, total)}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white px-4 py-3">
                      <span className="text-sm text-slate-500">
                        Completion Rate
                      </span>
                      <span className="text-sm font-semibold text-slate-900">
                        {pct(total - unanswered, total)}%
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 rounded-[20px] border border-indigo-200 bg-gradient-to-r from-indigo-50 via-violet-50 to-fuchsia-50 p-4">
                    <p className="text-sm font-semibold text-slate-900">
                      Recommended next move
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Start with mistakes first, then continue with another
                      focused session while this performance is still fresh.
                    </p>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 border-t border-slate-200/70 pt-5">
                    <Button
                      onClick={() => onReview("wrong")}
                      className="w-full justify-between rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-[0_12px_24px_-14px_rgba(79,70,229,0.35)] hover:opacity-95"
                    >
                      Review Mistakes
                      <ArrowRight className="h-4 w-4" />
                    </Button>

                    {onRetake ? (
                      <Button
                        variant="outline"
                        onClick={onRetake}
                        className="w-full justify-between rounded-2xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      >
                        Practice Center
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    ) : null}

                    {onPickAnother ? (
                      <Button
                        variant="outline"
                        onClick={onPickAnother}
                        className="w-full justify-between rounded-2xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      >
                        Pick Another Session
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
