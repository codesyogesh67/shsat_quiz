"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Eye,
  Flag,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import QuestionView from "@/components/practice/QuestionView";
import QuestionMap from "@/components/practice/QuestionMap";
import type { ReviewFilter, SessionResultsData } from "@/types/exam";

type ReviewQuestion = {
  id: string;
  stem: string;
  choices?: unknown[];
  imageUrl?: string | null;
  [key: string]: unknown;
};

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
  q: ReviewQuestion;
  questions: ReviewQuestion[];
  currentIdx: number;
  answers: Record<string, string | null>;
  flags: Record<string, boolean>;
  reviewFilter: ReviewFilter;
  results: SessionResultsData;
  onPrev: () => void;
  onNext: () => void;
  onJump: (idx: number) => void;
  onBackToResults: () => void;
  onSetFilter: (filter: ReviewFilter) => void;
  onToggleFlag: () => void;
};

function getCurrentResult(
  results: SessionResultsData,
  questionId: string,
  currentIdx: number
) {
  const list = results.perQuestion ?? [];
  return (
    list.find((item) => item.id === questionId) ?? list[currentIdx] ?? null
  );
}

export default function SessionReviewShell({
  q,
  questions,
  currentIdx,
  answers,
  flags,
  reviewFilter,
  results,
  onPrev,
  onNext,
  onJump,
  onBackToResults,
  onSetFilter,
  onToggleFlag,
}: Props) {
  const currentResult = getCurrentResult(results, q.id, currentIdx);
  const userAnswer = answers[q.id] ?? undefined;
  const correctAnswer = currentResult?.gold;
  const isCorrect = currentResult?.correct ?? false;

  const answersForMap = Object.fromEntries(
    Object.entries(answers ?? {}).map(([k, v]) => [k, v ?? ""])
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-sm"
          >
            <div className="border-b border-slate-200/70 bg-[radial-gradient(55rem_22rem_at_0%_0%,rgba(99,102,241,0.14),transparent_42%),radial-gradient(40rem_20rem_at_100%_0%,rgba(139,92,246,0.12),transparent_42%)]">
              <div className="px-5 py-6 sm:px-6">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                    <Eye className="mr-1.5 h-3.5 w-3.5" />
                    Review Mode
                  </span>

                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                    Question {currentIdx + 1} of {questions.length}
                  </span>

                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium capitalize text-slate-600">
                    Filter: {reviewFilter}
                  </span>
                </div>

                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                      Review Session
                    </h1>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Review your answers carefully and compare them with the
                      correct solution.
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    onClick={onBackToResults}
                    className="rounded-2xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Back to Results
                  </Button>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-4">
                  <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-4">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                      Status
                    </p>
                    <p
                      className={`mt-2 flex items-center text-sm font-semibold ${
                        isCorrect ? "text-emerald-700" : "text-rose-700"
                      }`}
                    >
                      {isCorrect ? (
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                      ) : (
                        <XCircle className="mr-2 h-4 w-4" />
                      )}
                      {isCorrect ? "Correct" : "Incorrect"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-4">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                      Your Answer
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {userAnswer ?? "No answer"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-4">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                      Correct Answer
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {correctAnswer ?? "N/A"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-4">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                      Marked
                    </p>
                    <p className="mt-2 flex items-center text-sm font-semibold text-slate-900">
                      <Bookmark className="mr-2 h-4 w-4 text-amber-600" />
                      {flags[q.id] ? "Yes" : "No"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Button
                    variant={reviewFilter === "all" ? "default" : "outline"}
                    onClick={() => onSetFilter("all")}
                    className={
                      reviewFilter === "all"
                        ? "rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20"
                        : "rounded-2xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }
                  >
                    All
                  </Button>

                  <Button
                    variant={reviewFilter === "wrong" ? "default" : "outline"}
                    onClick={() => onSetFilter("wrong")}
                    className={
                      reviewFilter === "wrong"
                        ? "rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20"
                        : "rounded-2xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }
                  >
                    Wrong
                  </Button>

                  <Button
                    variant={reviewFilter === "correct" ? "default" : "outline"}
                    onClick={() => onSetFilter("correct")}
                    className={
                      reviewFilter === "correct"
                        ? "rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20"
                        : "rounded-2xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }
                  >
                    Correct
                  </Button>

                  <Button
                    variant={reviewFilter === "flagged" ? "default" : "outline"}
                    onClick={() => onSetFilter("flagged")}
                    className={
                      reviewFilter === "flagged"
                        ? "rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20"
                        : "rounded-2xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }
                  >
                    Flagged
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-6 p-5 sm:p-6">
              <div className="rounded-3xl border border-slate-200/70 bg-white p-1">
                <QuestionView
                  mode="review"
                  question={q as never}
                  value={userAnswer ?? ""}
                  onChange={() => {}}
                  onClear={() => {}}
                  onFlag={onToggleFlag}
                  correctAnswer={correctAnswer}
                  userAnswer={userAnswer}
                />
              </div>
            </div>

            <div className="border-t border-slate-200/70 bg-slate-50/60 px-5 py-4 sm:px-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={onPrev}
                    disabled={currentIdx === 0}
                    className="rounded-2xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Prev
                  </Button>

                  <Button
                    variant="outline"
                    onClick={onToggleFlag}
                    className="rounded-2xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  >
                    <Flag className="mr-2 h-4 w-4" />
                    {flags[q.id] ? "Unmark Review" : "Mark Review"}
                  </Button>
                </div>

                <Button
                  onClick={onNext}
                  disabled={currentIdx >= questions.length - 1}
                  className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20 hover:opacity-95"
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.section>

          <motion.aside
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, ease: "easeOut", delay: 0.05 }}
            className="space-y-4 lg:sticky lg:top-24 lg:self-start"
          >
            <div className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900">
                Review Navigator
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Jump across questions and revisit marked items quickly.
              </p>

              <div className="mt-4">
                <QuestionMap
                  questions={questions as never}
                  currentIdx={currentIdx}
                  answers={answersForMap}
                  flags={flags}
                  onJump={onJump}
                />
              </div>
            </div>
          </motion.aside>
        </div>
      </div>
    </div>
  );
}
