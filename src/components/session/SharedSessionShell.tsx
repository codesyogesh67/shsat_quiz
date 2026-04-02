"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Sparkles,
  Target,
  Flag,
  X,
  HelpCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import QuestionView from "@/components/practice/QuestionView";
import QuestionMap from "@/components/practice/QuestionMap";
import type {
  ExamQuestion,
  ReviewFilter,
  SessionResultsData,
} from "@/types/exam";

type Props = {
  mode?: "practice" | "exam" | "diagnostic";
  title: string;
  subtitle?: string;

  questions: ExamQuestion[];
  currentIdx: number;
  answers: Record<string, string | null>;
  flags: Record<string, boolean>;
  secondsLeft: number;
  timePct: number;
  answeredCount: number;

  submitted: boolean;
  reviewing: boolean;
  reviewFilter: ReviewFilter;
  results?: SessionResultsData | null;

  onAnswer: (questionId: string, value: string) => void;
  onClear: (questionId: string) => void;
  onToggleFlag: (questionId: string) => void;
  onJump: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
  onSkip: () => void;
  onSubmit: () => void;

  onStartReview: (filter: ReviewFilter) => void;
  onStopReview: () => void;

  onExit: () => void;
  onRetake?: () => void;
  onPickAnother?: () => void;

  renderResults?: (args: {
    results: SessionResultsData;
    flags: Record<string, boolean>;
    onReview: (filter: ReviewFilter) => void;
    onRetake?: () => void;
    onPickAnother?: () => void;
  }) => React.ReactNode;

  renderReview?: (args: {
    q: ExamQuestion;
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
  }) => React.ReactNode;
};

function formatTime(totalSeconds: number) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function getTimeTone(timePct: number) {
  if (timePct <= 15) {
    return {
      wrap: "border-rose-200/80 bg-rose-50 text-rose-700",
      icon: "bg-rose-100 text-rose-700",
    };
  }

  if (timePct <= 35) {
    return {
      wrap: "border-amber-200/80 bg-amber-50 text-amber-700",
      icon: "bg-amber-100 text-amber-700",
    };
  }

  return {
    wrap: "border-slate-200 bg-white text-slate-800",
    icon: "bg-slate-100 text-slate-700",
  };
}

function getModeLabel(mode: Props["mode"]) {
  if (mode === "diagnostic") return "Diagnostic Session";
  if (mode === "exam") return "Full Exam Session";
  return "Practice Session";
}

function getModeDescription(mode: Props["mode"]) {
  if (mode === "diagnostic") {
    return "A balanced check of your current readiness across SHSAT topics.";
  }

  if (mode === "exam") {
    return "A timed exam-style environment to build confidence, pace, and accuracy.";
  }

  return "Focused problem solving to strengthen concepts and sharpen performance.";
}

export default function SharedSessionShell({
  mode = "practice",
  title,
  subtitle,
  questions = [],
  currentIdx,
  answers,
  flags,
  secondsLeft,
  timePct,
  answeredCount,
  submitted,
  reviewing,
  reviewFilter,
  results,
  onAnswer,
  onClear,
  onToggleFlag,
  onJump,
  onPrev,
  onNext,
  onSkip,
  onSubmit,
  onStartReview,
  onStopReview,
  onExit,
  onRetake,
  onPickAnother,
  renderResults,
  renderReview,
}: Props) {
  const [exitOpen, setExitOpen] = React.useState(false);
  const [submitOpen, setSubmitOpen] = React.useState(false);

  const total = questions.length;
  const q = questions[currentIdx];
  const currentId = q?.id;

  const answersForMap = React.useMemo(() => {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(answers)) {
      out[k] = v ?? "";
    }
    return out;
  }, [answers]);

  const flaggedCount = Object.values(flags).filter(Boolean).length;
  const timeTone = getTimeTone(timePct);
  const isLastQuestion = total > 0 && currentIdx >= total - 1;
  const unansweredCount = Math.max(total - answeredCount, 0);

  const minimumRequired = Math.ceil(total * 0.5);
  const canSubmit = answeredCount >= minimumRequired;
  const remainingToUnlock = Math.max(minimumRequired - answeredCount, 0);

  if (submitted && results && !reviewing && renderResults) {
    return (
      <>
        {renderResults({
          results,
          flags,
          onReview: onStartReview,
          onRetake,
          onPickAnother,
        })}
      </>
    );
  }

  if (submitted && results && reviewing && q && renderReview) {
    return (
      <>
        {renderReview({
          q,
          currentIdx,
          answers,
          flags,
          reviewFilter,
          results,
          onPrev,
          onNext,
          onJump,
          onBackToResults: onStopReview,
          onSetFilter: onStartReview,
          onToggleFlag: () => onToggleFlag(q.id),
        })}
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen">
        <div className="mx-auto w-full max-w-[1500px] px-3 py-3 sm:px-6 lg:px-8">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-5">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="min-w-0"
            >
              <Card className="overflow-hidden rounded-3xl border border-slate-200/70 bg-[radial-gradient(44rem_18rem_at_0%_0%,rgba(99,102,241,0.10),transparent_55%),radial-gradient(36rem_18rem_at_100%_0%,rgba(139,92,246,0.10),transparent_55%)] shadow-sm">
                <div className="relative overflow-hidden">
                  <div className="relative px-4 py-4 sm:px-6 sm:py-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                          <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                          {getModeLabel(mode)}
                        </span>

                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-xs font-medium text-slate-600">
                          Question {Math.min(currentIdx + 1, total)} of {total}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        // size="icon"
                        onClick={() => setExitOpen(true)}
                        className="app-icon-square"
                        aria-label="Exit session"
                      >
                        <X className="h-5 w-5 text-white" />
                      </Button>
                    </div>

                    <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                              {title}
                            </h1>

                            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
                              {subtitle ?? getModeDescription(mode)}
                            </p>
                          </div>

                          <div
                            className={`inline-flex h-12 shrink-0 items-center gap-2 rounded-2xl border px-3.5 shadow-sm sm:h-12 ${timeTone.wrap}`}
                          >
                            <span
                              className={`flex h-8 w-8 items-center justify-center rounded-xl ${timeTone.icon}`}
                            >
                              <Clock3 className="h-[18px] w-[18px]" />
                            </span>
                            <div className="flex flex-col leading-none">
                              <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500">
                                Time
                              </span>
                              <span className="mt-1 text-base font-semibold tabular-nums">
                                {formatTime(secondsLeft)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                          <div className="min-w-0 rounded-2xl border border-slate-200/70 bg-white/85 p-3 shadow-sm">
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                                <Target className="h-[18px] w-[18px]" />
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="truncate text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
                                  Answered
                                </p>
                                <p className="mt-1 truncate text-sm font-semibold text-slate-900">
                                  {answeredCount} of {total}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="min-w-0 rounded-2xl border border-slate-200/70 bg-white/85 p-3 shadow-sm">
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                                <Flag className="h-[18px] w-[18px]" />
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="truncate text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
                                  Flagged
                                </p>
                                <p className="mt-1 truncate text-sm font-semibold text-slate-900">
                                  {flaggedCount} marked
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <CardContent className="p-3 sm:p-5">
                  <div className="mb-2 block lg:hidden">
                    <div className="rounded-2xl border border-slate-200/70 bg-white/95 px-2.5 py-2 shadow-sm">
                      <div className="flex items-center justify-between gap-2 pl-5">
                        <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700">
                          Study Navigator
                        </h2>

                        <div className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 pr-3 text-[10px] font-medium text-slate-600">
                          {Math.min(currentIdx + 1, total)}/{total}
                        </div>
                      </div>

                      <div className="[&_button]:m-0 [&_button]:h-7 [&_button]:w-7 [&_button]:rounded-md [&_button]:p-0 [&_button]:text-[10px] [&_button]:font-medium">
                        <QuestionMap
                          questions={questions}
                          currentIdx={currentIdx}
                          answers={answersForMap}
                          flags={flags}
                          onJump={onJump}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-2 flex items-center justify-end">
                    <Button
                      type="button"
                      size="sm"
                      onClick={onNext}
                      disabled={!questions.length || isLastQuestion}
                      className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20 hover:opacity-95"
                    >
                      Next Question
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>

                  {q ? (
                    <div className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-sm">
                      <div className="border-b border-slate-200/70 bg-slate-50/70 px-4 py-3 sm:px-6">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              Current Question
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              Read carefully, solve with confidence, and mark
                              only when you are ready.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 sm:p-6">
                        <QuestionView
                          mode="test"
                          question={q}
                          value={currentId ? answers[currentId] ?? "" : ""}
                          onChange={(val) =>
                            currentId && onAnswer(currentId, val)
                          }
                          onClear={() => currentId && onClear(currentId)}
                          onFlag={() => currentId && onToggleFlag(currentId)}
                        />
                      </div>

                      <div className="border-t border-slate-200/70 bg-slate-50/50 px-4 py-3 sm:px-6 lg:hidden">
                        <div className="flex items-center justify-end">
                          <Button
                            type="button"
                            onClick={() => setSubmitOpen(true)}
                            className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20 hover:opacity-95"
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Submit Answers
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
                      <p className="text-sm text-slate-500">
                        No question available.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.aside
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, ease: "easeOut", delay: 0.05 }}
              className="hidden lg:block"
            >
              <Card className="sticky top-24 rounded-3xl border border-slate-200/70 bg-white/90 shadow-sm backdrop-blur-xl">
                <CardContent className="p-4">
                  <div className="mb-3">
                    <h2 className="text-sm font-semibold text-slate-900">
                      Study Navigator
                    </h2>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Move between questions and revisit anything flagged for
                      review.
                    </p>
                  </div>

                  <QuestionMap
                    questions={questions}
                    currentIdx={currentIdx}
                    answers={answersForMap}
                    flags={flags}
                    onJump={onJump}
                  />

                  <div className="mt-4 border-t border-slate-200/70 pt-4">
                    <Button
                      type="button"
                      onClick={() => setSubmitOpen(true)}
                      className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20 hover:opacity-95"
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Submit Answers
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.aside>
          </div>
        </div>
      </div>

      <AlertDialog open={submitOpen} onOpenChange={setSubmitOpen}>
        <AlertDialogContent className="max-w-md rounded-3xl border border-slate-200/70 bg-white p-0 shadow-2xl">
          <div className="overflow-hidden rounded-3xl">
            <div className="bg-[radial-gradient(26rem_14rem_at_0%_0%,rgba(99,102,241,0.12),transparent_55%),radial-gradient(18rem_12rem_at_100%_0%,rgba(139,92,246,0.10),transparent_55%)] px-6 py-5">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-md ${
                  canSubmit
                    ? "app-icon-filled shadow-indigo-500/20"
                    : "app-icon-filled shadow-amber-200/60"
                }`}
              >
                {canSubmit ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <HelpCircle className="h-5 w-5" />
                )}
              </div>

              <AlertDialogHeader className="mt-4 space-y-2 text-left">
                <AlertDialogTitle className="text-xl font-semibold tracking-tight text-slate-900">
                  {canSubmit
                    ? "Ready to finish?"
                    : "Submission not available yet"}
                </AlertDialogTitle>

                <AlertDialogDescription className="text-sm leading-6 text-slate-500">
                  {canSubmit
                    ? "Submit when you have reviewed your answers and flagged questions."
                    : `You need to answer at least ${minimumRequired} of ${total} questions before submitting. Answer ${remainingToUnlock} more to unlock submission.`}
                </AlertDialogDescription>
              </AlertDialogHeader>
            </div>

            <div className="px-6 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                    Answered
                  </p>
                  <p className="mt-1 text-base font-semibold text-slate-900">
                    {answeredCount}/{total}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                    Required
                  </p>
                  <p className="mt-1 text-base font-semibold text-slate-900">
                    {minimumRequired}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                    Flagged
                  </p>
                  <p className="mt-1 text-base font-semibold text-slate-900">
                    {flaggedCount}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                    Unanswered
                  </p>
                  <p className="mt-1 text-base font-semibold text-slate-900">
                    {unansweredCount}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-center text-[11px] leading-5 text-slate-500">
                {canSubmit
                  ? "Your session will be scored and moved to results."
                  : "This session will stay active and can be continued later from your active exams."}
              </p>
            </div>

            <AlertDialogFooter className="flex-col-reverse gap-2 border-t border-slate-200/70 bg-slate-50/70 px-6 py-4 sm:flex-row sm:justify-end">
              <AlertDialogCancel className="mt-0 rounded-2xl border-slate-200 bg-white text-slate-700 hover:bg-slate-100">
                {canSubmit ? "Keep Reviewing" : "Continue Test"}
              </AlertDialogCancel>

              {canSubmit ? (
                <AlertDialogAction
                  onClick={onSubmit}
                  className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:opacity-95"
                >
                  Submit Answers
                </AlertDialogAction>
              ) : (
                <AlertDialogAction onClick={onExit} className="rounded-2xl">
                  Exit Test
                </AlertDialogAction>
              )}
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={exitOpen} onOpenChange={setExitOpen}>
        <AlertDialogContent className="max-w-md rounded-3xl border border-slate-200/70 bg-white p-0 shadow-2xl">
          <div className="overflow-hidden rounded-3xl">
            <div className="bg-[radial-gradient(26rem_14rem_at_0%_0%,rgba(99,102,241,0.12),transparent_55%),radial-gradient(18rem_12rem_at_100%_0%,rgba(139,92,246,0.10),transparent_55%)] px-6 py-5">
              <AlertDialogHeader className="mt-4 space-y-2 text-left">
                <AlertDialogTitle className="text-xl font-semibold tracking-tight text-slate-900">
                  Exit this session?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm leading-6 text-slate-500">
                  Your current progress may be interrupted. Exit only if you are
                  sure you want to leave this session now.
                </AlertDialogDescription>
              </AlertDialogHeader>
            </div>

            <AlertDialogFooter className="flex-col-reverse gap-2 border-t border-slate-200/70 bg-slate-50/70 px-6 py-4 sm:flex-row sm:justify-end">
              <AlertDialogCancel className="mt-0 rounded-2xl border-slate-200 bg-white text-slate-700 hover:bg-slate-100">
                Stay in Session
              </AlertDialogCancel>

              <AlertDialogAction
                onClick={onExit}
                className="rounded-2xl text-white hover:opacity-95"
              >
                Yes, Exit Session
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
