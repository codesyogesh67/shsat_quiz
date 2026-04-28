"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  ChevronRight,
  Play,
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
        "Complete the guided plan below. As you finish more sessions, this area will become more personalized to your weakest SHSAT math category.",
    };
  }

  const hasFullExam = recentExams.some(
    (exam) => exam.scoreRaw >= 0 && exam.mode === "Full 57"
  );

  return {
    title: `${weakest.category} needs the most attention right now`,
    description: hasFullExam
      ? "Use targeted category work first, then return to mixed practice and another full exam to confirm progress."
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

export function WeakAreaImprovementPlan({
  categories,
  recentExams,
  onStartPlanSession,
  isStartingPlanSession = false,
}: Props) {
  const generatedPlan = generateStudyPlan(categories);
  const weakest = generatedPlan.weakestCategory;
  const planCards = generatedPlan.steps;

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
        <div className="absolute inset-0" />
        <div className="absolute -right-10 top-0 h-28 w-28 rounded-full bg-indigo-100/30 blur-2xl" />
        <div className="absolute -left-6 bottom-0 h-20 w-20 rounded-full bg-fuchsia-200/30 blur-2xl" />

        <div className="relative flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                <Target className="h-4.5 w-4.5" />
              </span>

              <h2 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
                Your improvement plan
              </h2>
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-indigo-600">
              <Sparkles className="h-3 w-3" />
              10-Step Plan
            </div>
          </div>

          <p className="text-sm text-slate-500">{summary.description}</p>
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
                  {weakest
                    ? "Use this as your main focus area first, then rebuild confidence with mixed review and full-exam practice."
                    : "You do not have enough category-level result data yet. Start with mixed work first so the dashboard can generate a stronger category-based plan."}
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
                  Plan length
                </div>
                <div className="mt-2 text-base font-semibold text-slate-900">
                  {planCards.length} sessions
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200/70 bg-gradient-to-br from-slate-50/80 via-white to-indigo-50/40 p-5 sm:p-6">
            <div className="mb-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-700">
                <CalendarDays className="h-3.5 w-3.5" />
                Guided schedule
              </div>

              <h3 className="mt-3 text-lg font-semibold text-slate-900">
                Your next study plan
              </h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Follow these sessions in order. Each step starts the actual exam
                directly.
              </p>
            </div>

            <div className="space-y-3">
              {planCards.map((card, index) => {
                const StepIcon = getStepIcon(card.id);
                const dateLabel = getPlanDateLabel(index);

                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() =>
                      onStartPlanSession(
                        card.categoryKey,
                        card.questions,
                        card.minutes
                      )
                    }
                    disabled={isStartingPlanSession}
                    className={cn(
                      "block w-full cursor-pointer rounded-3xl border bg-gradient-to-br p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60",
                      card.accentClass
                    )}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
                            <StepIcon className="h-4 w-4" />
                          </span>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-semibold text-slate-900">
                                {card.label}
                              </p>

                              <span className="rounded-full border border-white/80 bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                                {card.badge}
                              </span>
                            </div>

                            <p className="mt-1 text-xs leading-5 text-slate-500">
                              {card.description}
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
                        Session {index + 1} of {planCards.length}
                      </span>

                      <span className="inline-flex items-center gap-1 text-sm font-medium text-slate-700">
                        Start
                        <ChevronRight className="h-4 w-4" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 rounded-3xl border border-dashed border-indigo-200 bg-white/80 p-4">
              <p className="text-sm font-medium text-slate-800">
                How this evolves
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                As more results come in, this plan can keep shifting toward the
                categories where accuracy is weakest and recommend stronger next
                steps automatically.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
