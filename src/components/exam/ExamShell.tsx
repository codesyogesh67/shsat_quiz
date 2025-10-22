// components/exam/ExamShell.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import QuestionView from "@/components/practice/QuestionView";
import QuestionMap from "@/components/practice/QuestionMap";

import ExamTopBar from "./ExamTopBar";
import ExamResults from "./ExamResults";
import ExamReviewPanel from "./ExamReviewPanel";

import { useExamController } from "./useExamController";
import type { ExamQuestion } from "./useExamController";

type Props = {
  sessionId: string;
  minutes: number;
  questions: ExamQuestion[];
  /** Optional: hydrate when resuming */
  initialAnswers?: Record<string, string | null>;
  initialFlags?: Record<string, boolean>;
  initialSecondsLeft?: number;
};

export default function ExamShell({
  sessionId,
  minutes,
  questions,
  initialAnswers,
  initialFlags,
  initialSecondsLeft,
}: Props) {
  const router = useRouter();

  const {
    // state/derived
    q,
    total,
    currentIdx,
    answers,
    flags,
    secondsLeft,
    timePct,
    submitted,
    results,
    reviewing,
    reviewFilter,
    navList,
    answeredCount,

    // actions
    setAnswer,
    clearAnswer,
    toggleFlag,
    go,
    next,
    prev,
    skip,
    submit,
    startReview,
    stopReview,
  } = useExamController({
    sessionId,
    minutes,
    questions,
    initialAnswers,
    initialFlags,
    initialSecondsLeft,
  });

  // -------- Results --------
  if (submitted && results && !reviewing) {
    const examLabel = "SHSAT Practice"; // or pass via parent if you want the set name
    return (
      <ExamResults
        examSet={examLabel}
        results={{
          ...results,
          byCategory: results?.byCategory ?? {},
          perQuestion:
            results?.perQuestion?.map(({ user, gold, ...rest }) => ({
              ...rest,
              user: user ?? undefined, // null → undefined
              gold: gold ?? undefined, // null → undefined
            })) ?? [],
        }}
        flags={flags}
        onReview={(filter) => startReview(filter)}
        onRetake={() => router.push("/practice")} // adjust route as you like
        onPickAnother={() => router.push("/practice")}
      />
    );
  }

  // -------- Review --------
  {
    submitted && results && reviewing && q && (
      <ExamReviewPanel
        q={q}
        currentIdx={currentIdx}
        navList={navList}
        reviewFilter={reviewFilter}
        results={{
          ...results,
          byCategory: results.byCategory ?? {}, // ensure object
          perQuestion:
            results.perQuestion?.map(({ user, gold, ...rest }) => ({
              ...rest,
              user: user ?? undefined, // null -> undefined if needed
              gold: gold ?? undefined, // null -> undefined if needed
            })) ?? [],
        }}
        answers={answers}
        flags={flags}
        onPrev={prev}
        onNext={next}
        onJump={go}
        onSetFilter={(f) => startReview(f)}
        onBackToResults={stopReview}
        onToggleFlag={() => toggleFlag(q.id)}
      />
    );
  }

  // -------- Active Exam --------
  const answeredMeta = `Question ${
    currentIdx + 1
  } / ${total} · Answered ${answeredCount}`;
  const currentId = q?.id;

  const answersForMap: Record<string, string> = React.useMemo(() => {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(answers)) out[k] = v ?? "";
    return out;
  }, [answers]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
      <Card>
        <ExamTopBar
          examLabel="SHSAT Practice"
          minutes={minutes}
          secondsLeft={secondsLeft}
          timePct={timePct}
          answeredMeta={answeredMeta}
          onExit={() => router.push("/")}
          onSubmit={() => submit(false)}
        />

        <CardContent>
          {q && (
            <QuestionView
              mode="test"
              question={q}
              value={currentId ? answers[currentId] ?? "" : ""}
              onChange={(val) => currentId && setAnswer(currentId, val)}
              onClear={() => currentId && clearAnswer(currentId)}
              onFlag={() => currentId && toggleFlag(currentId)}
            />
          )}
        </CardContent>

        <div className="flex items-center justify-between gap-2 px-6 pb-6">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prev}
              disabled={!questions.length || currentIdx === 0}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={skip}
              disabled={!questions.length || currentIdx >= total - 1}
            >
              Skip
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => currentId && toggleFlag(currentId)}
              disabled={!currentId}
            >
              {currentId && flags[currentId] ? "Unmark" : "Mark for review"}
            </Button>
            <Button
              size="sm"
              onClick={next}
              disabled={!questions.length || currentIdx >= total - 1}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      <aside className="lg:sticky lg:top-20">
        <QuestionMap
          questions={questions}
          currentIdx={currentIdx}
          answers={answersForMap} // 👈 normalized (no nulls)
          flags={flags}
          onJump={go}
        />
      </aside>
    </div>
  );
}
