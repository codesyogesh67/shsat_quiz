"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Flag,
  RotateCcw,
  Sparkles,
  Target,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReviewFilter, SessionResultsData } from "@/types/exam";

type ResultPerQuestion = {
  id: string;
  correct: boolean;
  user?: string;
  gold?: string;
};

// type SessionResultsData = {
//   score?: number;
//   correct?: number;
//   wrong?: number;
//   unanswered?: number;
//   total?: number;
//   byCategory?: Record<string, number>;
//   perQuestion?: ResultPerQuestion[];
// };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-sm"
          >
            <div className="border-b border-slate-200/70 bg-[radial-gradient(55rem_22rem_at_0%_0%,rgba(99,102,241,0.14),transparent_42%),radial-gradient(40rem_20rem_at_100%_0%,rgba(139,92,246,0.12),transparent_42%)]">
              <div className="px-5 py-6 sm:px-6 sm:py-7">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                    <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                    {formatModeLabel(mode)}
                  </span>

                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-xs font-medium text-slate-600">
                    {total} questions reviewed
                  </span>
                </div>

                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                  {title}
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  {subtitle}
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-5 shadow-sm">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Score
                    </p>
                    <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                      {score}%
                    </p>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 transition-all duration-300"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-5 shadow-sm">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Correct
                    </p>
                    <p className="mt-2 flex items-center text-3xl font-semibold tracking-tight text-slate-900">
                      <CheckCircle2 className="mr-2 h-6 w-6 text-emerald-600" />
                      {correct}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      {pct(correct, total)}% accuracy
                    </p>
                  </div>

                  <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-5 shadow-sm">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Wrong
                    </p>
                    <p className="mt-2 flex items-center text-3xl font-semibold tracking-tight text-slate-900">
                      <XCircle className="mr-2 h-6 w-6 text-rose-600" />
                      {wrong}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      Questions to revisit
                    </p>
                  </div>

                  <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-5 shadow-sm">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Unanswered
                    </p>
                    <p className="mt-2 flex items-center text-3xl font-semibold tracking-tight text-slate-900">
                      <Clock3 className="mr-2 h-6 w-6 text-amber-600" />
                      {unanswered}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      Time management opportunity
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6 p-5 sm:p-6">
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-3xl border border-slate-200/70 bg-slate-50/70 p-5">
                  <h2 className="text-base font-semibold text-slate-900">
                    Review Actions
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Jump directly into the type of review you want most.
                  </p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <Button
                      onClick={() => onReview("all")}
                      className="justify-between rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20 hover:opacity-95"
                    >
                      Review All
                      <ArrowRight className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => onReview("wrong")}
                      className="justify-between rounded-2xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    >
                      Review Wrong
                      <ArrowRight className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => onReview("correct")}
                      className="justify-between rounded-2xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    >
                      Review Correct
                      <ArrowRight className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => onReview("flagged")}
                      className="justify-between rounded-2xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    >
                      Review Flagged
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200/70 bg-slate-50/70 p-5">
                  <h2 className="text-base font-semibold text-slate-900">
                    Session Summary
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    A quick snapshot of how this session went.
                  </p>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
                      <span className="text-sm text-slate-500">
                        Total Questions
                      </span>
                      <span className="text-sm font-semibold text-slate-900">
                        {total}
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
                      <span className="text-sm text-slate-500">
                        Marked for Review
                      </span>
                      <span className="flex items-center text-sm font-semibold text-slate-900">
                        <Flag className="mr-1.5 h-4 w-4 text-amber-600" />
                        {marked}
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
                      <span className="text-sm text-slate-500">Accuracy</span>
                      <span className="text-sm font-semibold text-slate-900">
                        {pct(correct, total)}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
                      <span className="text-sm text-slate-500">
                        Completion Rate
                      </span>
                      <span className="text-sm font-semibold text-slate-900">
                        {pct(total - unanswered, total)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200/70 bg-white p-5">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <Target className="h-5 w-5" />
                  </span>

                  <div>
                    <h2 className="text-base font-semibold text-slate-900">
                      Category Performance
                    </h2>
                    <p className="text-sm text-slate-500">
                      Breakdown by topic for this session.
                    </p>
                  </div>
                </div>
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

                  return (
                    <div
                      key={name}
                      className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-slate-900">
                          {name}
                        </p>
                        <span className="text-sm font-semibold text-slate-700">
                          {valuePct}%
                        </span>
                      </div>

                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-600"
                          style={{ width: `${valuePct}%` }}
                        />
                      </div>

                      <p className="mt-2 text-xs text-slate-500">
                        Category accuracy
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.section>

          <motion.aside
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, ease: "easeOut", delay: 0.05 }}
            className="space-y-4 xl:sticky xl:top-24 xl:self-start"
          >
            <div className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900">
                Next Step
              </h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Continue with review now or return to the practice center for a
                new session.
              </p>

              <div className="mt-5 space-y-3">
                <Button
                  onClick={() => onReview("wrong")}
                  className="w-full justify-between rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20 hover:opacity-95"
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
          </motion.aside>
        </div>
      </div>
    </div>
  );
}
