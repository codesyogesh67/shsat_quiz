"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { ExamQuestion } from "@/types/exam";

type Props = {
  questions: ExamQuestion[];
  currentIdx: number;
  answers: Record<string, string>;
  flags: Record<string, boolean>;
  onJump: (i: number) => void;
};

export default function QuestionMap({
  questions,
  currentIdx,
  answers,
  flags,
  onJump,
}: Props) {
  return (
    <Card className="rounded-3xl border border-slate-200/70 bg-white p-4 shadow-sm">
      <div className="mb-3">
        <div className="text-sm font-semibold tracking-tight text-slate-900">
          Question map
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Jump between questions and track your progress.
        </p>
      </div>

      <Separator className="mb-4 bg-slate-200/70" />

      <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 lg:grid-cols-6 xl:grid-cols-5">
        {questions.map((q, i) => {
          const answered = answers[q.id] != null && answers[q.id] !== "";
          const flagged = !!flags[q.id];
          const isCurrent = i === currentIdx;

          return (
            <button
              key={q.id}
              type="button"
              onClick={() => onJump(i)}
              aria-label={`Go to question ${i + 1}${
                answered ? ", answered" : ""
              }${flagged ? ", flagged" : ""}`}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl border text-xs font-semibold",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200",
                isCurrent
                  ? "border-indigo-600 bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20"
                  : "transition-colors duration-150",
                !isCurrent &&
                  (answered
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"),
                flagged && !isCurrent && "ring-2 ring-amber-400/80"
              )}
            >
              <span className="leading-none text-current">{i + 1}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] text-slate-500 lg:grid-cols-2">
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded bg-slate-200" />
          Unanswered
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded bg-emerald-200" />
          Answered
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded bg-white ring-2 ring-amber-400" />
          Flagged
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded bg-gradient-to-br from-indigo-600 to-violet-600" />
          Current
        </div>
      </div>
    </Card>
  );
}
