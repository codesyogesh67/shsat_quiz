"use client";

import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import QuestionView from "@/components/practice/QuestionView";
import type {
  ExamQuestion,
  ReviewFilter,
  SessionResultsData,
} from "@/types/exam";

type Props = {
  q: ExamQuestion;
  currentIdx: number;
  navList: number[];
  reviewFilter: ReviewFilter;

  results: SessionResultsData | null;
  answers: Record<string, string | null>;
  flags: Record<string, boolean>;

  onPrev: () => void;
  onNext: () => void;
  onJump: (idx: number) => void;
  onSetFilter: (f: ReviewFilter) => void;
  onBackToResults: () => void;
  onToggleFlag: () => void;
};

export default function ExamReviewPanel({
  q,
  currentIdx,
  navList,
  reviewFilter,
  results,
  answers,
  flags,
  onPrev,
  onNext,
  onJump,
  onSetFilter,
  onBackToResults,
  onToggleFlag,
}: Props) {
  const totalInReview = navList.length;
  const positionMeta = `Question ${currentIdx + 1} / ${totalInReview}`;

  const byCategory = results?.byCategory ?? {};
  const perQ = results?.perQuestion ?? [];

  const currentUser = answers[q.id] ?? null;
  const match = perQ.find((r) => r.id === q.id);

  const currentGold = typeof match?.gold === "string" ? match.gold : undefined;

  const isCorrect =
    match?.correct ??
    (currentUser != null && currentGold != null && currentUser === currentGold);

  const isFlagged = !!flags[q.id];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">
            Review — <span className="font-normal">{positionMeta}</span>
          </CardTitle>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={isCorrect ? "default" : "destructive"}>
              {isCorrect ? "Correct" : "Incorrect"}
            </Badge>
            {isFlagged && <Badge variant="secondary">Flagged</Badge>}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <QuestionView
            mode="review"
            question={q}
            value={currentUser ?? ""}
            correctAnswer={currentGold}
            userAnswer={currentUser ?? undefined}
            onChange={() => {}}
            onClear={() => {}}
            onFlag={onToggleFlag}
          />

          <div className="rounded-md bg-muted p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">Your answer:</span>
              <code className="rounded bg-background px-2 py-0.5">
                {currentUser ?? "—"}
              </code>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="font-medium">Correct answer:</span>
              <code className="rounded bg-background px-2 py-0.5">
                {currentGold ?? "—"}
              </code>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onPrev}
              disabled={currentIdx <= 0}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              onClick={onNext}
              disabled={currentIdx >= totalInReview - 1}
            >
              Next
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant={isFlagged ? "secondary" : "outline"}
              onClick={onToggleFlag}
            >
              {isFlagged ? "Unmark" : "Mark for review"}
            </Button>
            <Button onClick={onBackToResults}>Back to results</Button>
          </div>
        </CardFooter>
      </Card>

      <aside className="lg:sticky lg:top-20">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Review controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={reviewFilter === "all" ? "default" : "outline"}
                onClick={() => onSetFilter("all")}
              >
                All
              </Button>
              <Button
                size="sm"
                variant={reviewFilter === "wrong" ? "default" : "outline"}
                onClick={() => onSetFilter("wrong")}
              >
                Mistakes
              </Button>
              <Button
                size="sm"
                variant={reviewFilter === "correct" ? "default" : "outline"}
                onClick={() => onSetFilter("correct")}
              >
                Correct
              </Button>
              <Button
                size="sm"
                variant={reviewFilter === "flagged" ? "default" : "outline"}
                onClick={() => onSetFilter("flagged")}
              >
                Flagged
              </Button>
            </div>

            <Separator />

            <div>
              <h3 className="mb-2 text-sm font-semibold">By category</h3>
              <div className="space-y-2">
                {Object.keys(byCategory).length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No category data
                  </p>
                ) : (
                  Object.entries(byCategory).map(([cat, v]) => {
                    const pct = v.total
                      ? Math.round((v.correct / v.total) * 100)
                      : 0;

                    return (
                      <div key={cat}>
                        <div className="flex items-center justify-between text-xs">
                          <span className="truncate font-medium">{cat}</span>
                          <span className="text-muted-foreground">
                            {v.correct}/{v.total} ({pct}%)
                          </span>
                        </div>
                        <Progress value={pct} />
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="mb-2 text-sm font-semibold">Questions</h3>
              <div className="grid grid-cols-8 gap-x-2 gap-y-2">
                {navList.map((absIdx, i) => {
                  const key = String(absIdx);
                  const isCurrent = i === currentIdx;

                  return (
                    <Button
                      key={key}
                      size="sm"
                      variant={isCurrent ? "default" : "outline"}
                      className="h-8 w-8 p-0"
                      onClick={() => onJump(absIdx)}
                    >
                      {i + 1}
                    </Button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
