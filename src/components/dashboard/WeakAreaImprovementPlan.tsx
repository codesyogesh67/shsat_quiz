"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Lock,
  Play,
  RefreshCcw,
  Shuffle,
  Sparkles,
  Target,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { DashboardData, ExamResult } from "./types";
import { pct } from "./utils";
import { generateStudyPlan } from "@/lib/plan/generateStudyPlan";

type CategoryStat = DashboardData["categoryStats"][number];

type Props = {
  categories: DashboardData["categoryStats"];
  recentExams: ExamResult[];
  onStartPlanSession: (
    category: string,
    count?: number,
    minutes?: number
  ) => void;
  isStartingPlanSession?: boolean;
  completedPlanSessions?: number;
  onAnalyzeImprovementPlan?: () => void;
  isAnalyzingPlan?: boolean;
};

function getCategoryTheme(category: string) {
  switch (category) {
    case "Algebra":
      return {
        icon: Target,
        chip: "border-indigo-200 bg-indigo-50 text-indigo-700",
        lightCard:
          "border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-violet-50",
      };
    case "Arithmetic":
      return {
        icon: Sparkles,
        chip: "border-emerald-200 bg-emerald-50 text-emerald-700",
        lightCard:
          "border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-cyan-50",
      };
    case "Geometry":
      return {
        icon: BarChart3,
        chip: "border-amber-200 bg-amber-50 text-amber-700",
        lightCard:
          "border-amber-200 bg-gradient-to-br from-amber-50 via-white to-rose-50",
      };
    case "Probability and Statistics":
      return {
        icon: BarChart3,
        chip: "border-sky-200 bg-sky-50 text-sky-700",
        lightCard:
          "border-sky-200 bg-gradient-to-br from-sky-50 via-white to-blue-50",
      };
    default:
      return {
        icon: BookOpen,
        chip: "border-slate-200 bg-slate-50 text-slate-700",
        lightCard:
          "border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-100",
      };
  }
}

function getPlanSummary(
  weakest: CategoryStat | null,
  recentExams: ExamResult[]
) {
  if (!weakest) {
    return {
      title: "Build your first improvement path",
      description:
        "Complete a diagnostic or practice session first. Then your improvement plan will be built from real performance data.",
    };
  }

  const hasFullExam = recentExams.some(
    (exam) => exam.scoreRaw >= 0 && exam.mode === "Full 57"
  );

  return {
    title: `${weakest.category} needs the most attention right now`,
    description: hasFullExam
      ? "Start with targeted category work, then return to mixed practice and another full exam to confirm progress."
      : "Start with focused category sessions, then blend your weak area into mixed review before moving into a full SHSAT exam.",
  };
}

function getPlanDateLabel(stepIndex: number) {
  const date = new Date();
  date.setDate(date.getDate() + stepIndex);

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getStepIcon(id: string) {
  if (id.includes("mixed")) return Shuffle;
  if (id.includes("full") || id.includes("shsat")) return BookOpen;
  return Play;
}

function EmptyImprovementPlanState() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_20px_80px_-40px_rgba(79,70,229,0.35)]"
    >
      <div className="absolute -right-12 top-0 h-36 w-36 rounded-full bg-indigo-100/50 blur-3xl" />
      <div className="absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-fuchsia-100/60 blur-3xl" />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 app-icon-filled">
            <Target className="h-5 w-5" />
          </div>

          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-700">
              <Sparkles className="h-3.5 w-3.5" />
              Improvement plan locked
            </div>

            <h2 className="text-xl font-semibold tracking-tight text-slate-900">
              Your improvement plan will appear after your first sessions
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Complete a diagnostic or practice session first. Once the app has
              real performance data, it will identify weak areas and build a
              focused 10-step improvement plan.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/70 bg-gradient-to-br from-slate-50 via-white to-indigo-50/60 p-4 shadow-sm lg:w-[280px]">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Next step
          </p>

          <p className="mt-2 text-sm font-semibold text-slate-900">
            Finish your first session
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Your plan becomes personalized after your results are saved.
          </p>
        </div>
      </div>

      <div className="relative mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-[22px] border border-slate-200/70 bg-white/80 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Step 1
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            Complete diagnostic
          </p>
        </div>

        <div className="rounded-[22px] border border-slate-200/70 bg-white/80 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Step 2
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            Review results
          </p>
        </div>

        <div className="rounded-[22px] border border-slate-200/70 bg-white/80 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Step 3
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            Unlock improvement plan
          </p>
        </div>
      </div>
    </motion.section>
  );
}

export function WeakAreaImprovementPlan({
  categories,
  recentExams,
  onStartPlanSession,
  isStartingPlanSession = false,
  completedPlanSessions = 0,
  onAnalyzeImprovementPlan,
  isAnalyzingPlan = false,
}: Props) {
  const hasExamHistory = recentExams.length > 0;
  const hasCategoryData = categories.some((category) => category.attempted > 0);

  if (!hasExamHistory || !hasCategoryData) {
    return <EmptyImprovementPlanState />;
  }

  const generatedPlan = generateStudyPlan(categories);
  const weakest = generatedPlan.weakestCategory;
  const planCards = generatedPlan.steps.slice(0, 10);

  const totalSteps = planCards.length || 10;
  const completedSteps = Math.min(completedPlanSessions, totalSteps);
  const progressPercent = Math.round((completedSteps / totalSteps) * 100);
  const canAnalyzePlan = completedSteps >= 5;

  const summary = getPlanSummary(weakest, recentExams);
  const theme = getCategoryTheme(weakest?.category ?? "");
  const Icon = theme.icon;

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden rounded-[28px] border border-slate-200/70 bg-white shadow-[0_20px_80px_-40px_rgba(79,70,229,0.35)]"
    >
      <div className="relative overflow-hidden border-b border-indigo-400/20 px-5 py-4 sm:px-6">
        <div className="absolute -right-10 top-0 h-28 w-28 rounded-full bg-indigo-100/40 blur-2xl" />
        <div className="absolute -left-6 bottom-0 h-20 w-20 rounded-full bg-fuchsia-200/40 blur-2xl" />

        <div className="relative flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                <Target className="h-4 w-4" />
              </span>

              <h2 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
                Your improvement plan
              </h2>

              <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-indigo-600">
                <Sparkles className="h-3 w-3" />
                Stable 10-Step Plan
              </div>
            </div>

            <p className="mt-2 text-sm text-slate-500">{summary.description}</p>
          </div>

          <div className="rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 shadow-sm">
            <p className="text-xs font-medium text-slate-500">Plan progress</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {completedSteps}/{totalSteps} sessions completed
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div
          className={cn(
            "overflow-hidden rounded-[26px] border shadow-sm",
            theme.lightCard
          )}
        >
          <div className="p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                  <Play className="h-3.5 w-3.5" />
                  Weak Area Snapshot
                </div>

                <h3 className="text-xl font-semibold text-slate-900">
                  {summary.title}
                </h3>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                  Use this as your main focus area first, then rebuild
                  confidence with mixed review and full-exam practice.
                </p>
              </div>

              <span
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold",
                  theme.chip
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {weakest ? weakest.category : "Starter plan"}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-[20px] border border-slate-200/80 bg-white/90 p-4 shadow-sm">
                <div className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                  Focus category
                </div>
                <div className="mt-2 text-base font-semibold text-slate-900">
                  {weakest ? weakest.category : "Mixed foundation"}
                </div>
              </div>

              <div className="rounded-[20px] border border-slate-200/80 bg-white/90 p-4 shadow-sm">
                <div className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                  Current accuracy
                </div>
                <div className="mt-2 text-base font-semibold text-slate-900">
                  {weakest ? `${pct(weakest.accuracy)}%` : "--"}
                </div>
              </div>

              <div className="rounded-[20px] border border-slate-200/80 bg-white/90 p-4 shadow-sm">
                <div className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                  Refresh checkpoint
                </div>
                <div className="mt-2 text-base font-semibold text-slate-900">
                  After 5 sessions
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-3xl border border-indigo-200 bg-indigo-50/60 p-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-white text-indigo-700 shadow-sm">
                  <Lock className="h-4 w-4" />
                </span>

                <div>
                  <p className="text-sm font-semibold text-indigo-950">
                    Plan stability
                  </p>
                  <p className="mt-1 text-sm leading-6 text-indigo-900/75">
                    This plan stays fixed so students can follow a clear path.
                    After 5 completed sessions, the app can re-analyze progress
                    and refresh the next steps using newer practice data.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200/70 bg-gradient-to-br from-slate-50/80 via-white to-indigo-50/40 p-5 sm:p-6">
            <div className="mb-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-700">
                <CalendarDays className="h-3.5 w-3.5" />
                Guided schedule
              </div>

              <h3 className="mt-3 text-lg font-semibold text-slate-900">
                Your next study plan
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Follow these sessions in order. The first next steps stay
                unlocked so the student always knows exactly what to do.
              </p>

              <div className="mt-5 rounded-2xl border border-slate-200/70 bg-white/85 p-4 shadow-sm">
                <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-500">
                  <span>Progress checkpoint</span>
                  <span>
                    {completedSteps}/{totalSteps} sessions
                  </span>
                </div>

                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-600 via-violet-500 to-fuchsia-500 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <p className="mt-3 text-xs leading-5 text-slate-500">
                  {canAnalyzePlan
                    ? "Enough sessions are complete. Re-analyze when you want to refresh the next part of the plan."
                    : `Complete ${5 - completedSteps} more session${
                        5 - completedSteps === 1 ? "" : "s"
                      } to unlock the next plan analysis.`}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {planCards.map((card, index) => {
                const StepIcon = getStepIcon(card.id);
                const dateLabel = getPlanDateLabel(index);
                const isCompleted = index < completedSteps;
                const isLocked = index > completedSteps + 1;

                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => {
                      if (isLocked) return;

                      onStartPlanSession(
                        card.categoryKey,
                        card.questions,
                        card.minutes
                      );
                    }}
                    disabled={isStartingPlanSession || isLocked || isCompleted}
                    className={cn(
                      "block w-full rounded-3xl border bg-gradient-to-br p-4 text-left transition-all duration-300",
                      "hover:-translate-y-0.5 hover:shadow-md",
                      "disabled:cursor-not-allowed",
                      card.accentClass,
                      isCompleted && "opacity-75",
                      isLocked && "opacity-60 grayscale-[0.2]"
                    )}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
                            {isCompleted ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            ) : isLocked ? (
                              <Lock className="h-4 w-4 text-slate-500" />
                            ) : (
                              <StepIcon className="h-4 w-4" />
                            )}
                          </span>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-semibold text-slate-900">
                                {card.label}
                              </p>

                              <span className="rounded-full border border-white/80 bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                                {isCompleted
                                  ? "Completed"
                                  : isLocked
                                  ? "Locked"
                                  : card.badge}
                              </span>
                            </div>

                            <p className="mt-1 text-xs leading-5 text-slate-500">
                              {isLocked
                                ? "Complete the previous sessions to unlock this step."
                                : card.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {dateLabel}
                        </span>

                        <span className="text-xs font-medium text-slate-600">
                          {card.questions} questions · {card.minutes} min
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-white/60 pt-3">
                      <span className="text-xs font-medium text-slate-600">
                        Session {index + 1} of {totalSteps}
                      </span>

                      <span className="inline-flex items-center gap-1 text-sm font-medium text-slate-700">
                        {isCompleted ? "Done" : isLocked ? "Locked" : "Start"}
                        {isLocked ? (
                          <Lock className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div
              className={cn(
                "mt-5 rounded-3xl border p-4",
                canAnalyzePlan
                  ? "border-indigo-200 bg-white shadow-sm"
                  : "border-dashed border-slate-200 bg-white/75"
              )}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {canAnalyzePlan
                      ? "Ready to update your plan"
                      : "Next analysis unlocks after 5 sessions"}
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {canAnalyzePlan
                      ? "You’ve completed enough work. Re-analyze progress to refresh the next part of the plan."
                      : "The plan stays stable for now, so the student can focus without the roadmap changing too often."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onAnalyzeImprovementPlan}
                  disabled={
                    !canAnalyzePlan ||
                    !onAnalyzeImprovementPlan ||
                    isAnalyzingPlan
                  }
                  className={cn(
                    "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all duration-300",
                    canAnalyzePlan
                      ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm hover:-translate-y-0.5 hover:shadow-md"
                      : "border border-slate-200 bg-slate-50 text-slate-400",
                    "disabled:cursor-not-allowed disabled:opacity-60"
                  )}
                >
                  <RefreshCcw
                    className={cn("h-4 w-4", isAnalyzingPlan && "animate-spin")}
                  />
                  {isAnalyzingPlan
                    ? "Analyzing..."
                    : "Analyze improvement plan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
