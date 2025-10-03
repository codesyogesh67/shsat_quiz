// components/practice/QuestionMap.tsx
"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Question } from "./PracticeShell";

export default function QuestionMap({
  questions,
  currentIdx,
  answers,
  flags,
  onJump,
}: {
  questions: Question[];
  currentIdx: number;
  answers: Record<string, string>;
  flags: Record<string, boolean>;
  onJump: (i: number) => void;
}) {
  return (
    <Card className="p-4">
      <div className="mb-2 text-sm font-semibold">Question map</div>
      <Separator className="mb-3" />
      <div className="grid grid-cols-10 gap-2 lg:grid-cols-6">
        {questions.map((q, i) => {
          const answered = answers[q.id] != null;
          const flagged = !!flags[q.id];
          const isCurrent = i === currentIdx;

          const cls =
            "flex h-9 w-9 items-center justify-center rounded-md border text-xs font-medium " +
            (isCurrent
              ? "border-primary"
              : answered
              ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200/50"
              : "bg-muted") +
            (flagged ? " ring-2 ring-amber-500" : "");

          return (
            <button
              key={q.id}
              className={cls}
              onClick={() => onJump(i)}
              aria-label={`Go to question ${i + 1}${
                answered ? ", answered" : ""
              }${flagged ? ", flagged" : ""}`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded bg-muted" /> Unanswered
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded bg-emerald-500/20" />{" "}
          Answered
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded ring-2 ring-amber-500" />{" "}
          Flagged
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded border border-primary" />{" "}
          Current
        </div>
      </div>
    </Card>
  );
}
