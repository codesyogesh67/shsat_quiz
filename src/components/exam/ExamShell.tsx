"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import SharedSessionShell from "@/components/session/SharedSessionShell";
import ExamReviewPanel from "./ExamReviewPanel";
import { useExamController } from "./useExamController";
import type { ExamQuestion } from "@/types/exam";

type Props = {
  sessionId: string;
  minutes: number;
  questions: ExamQuestion[];
  initialAnswers?: Record<string, string | null>;
  initialFlags?: Record<string, boolean>;
  initialSecondsLeft?: number;
  mode?: "exam" | "diagnostic";
};

export default function ExamShell({
  sessionId,
  minutes,
  questions,
  initialAnswers,
  initialFlags,
  initialSecondsLeft,
  mode = "exam",
}: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
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

  const minimumRequired = Math.ceil(total * 0.5);
  const canSubmit = answeredCount >= minimumRequired;
  const exitPath = mode === "diagnostic" ? "/diagnostic" : "/practice";

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;

    try {
      setIsSubmitting(true);

      const result = await submit();

      if (!result?.ok) return;

      const target =
        mode === "diagnostic"
          ? `/diagnostic/${sessionId}/pending`
          : `/practice/${sessionId}/pending`;

      router.replace(target);
    } catch (error) {
      console.error("Submit failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      <SharedSessionShell
        mode={mode}
        title={
          mode === "diagnostic" ? "SHSAT Diagnostic" : "SHSAT Practice Exam"
        }
        subtitle={
          mode === "diagnostic"
            ? "A timed assessment to understand your strongest and weakest categories."
            : "A focused timed exam experience designed to feel calm, premium, and structured."
        }
        questions={questions}
        currentIdx={currentIdx}
        answers={answers}
        flags={flags}
        secondsLeft={secondsLeft}
        timePct={timePct}
        answeredCount={answeredCount}
        submitted={submitted}
        reviewing={reviewing}
        reviewFilter={reviewFilter}
        results={results}
        onAnswer={setAnswer}
        onClear={clearAnswer}
        onToggleFlag={toggleFlag}
        onJump={go}
        onPrev={prev}
        onNext={next}
        onSkip={skip}
        onSubmit={handleSubmit}
        onStartReview={startReview}
        onStopReview={stopReview}
        onExit={() => router.push(exitPath)}
        onRetake={() => router.push(exitPath)}
        onPickAnother={() => router.push(exitPath)}
        renderReview={({
          q,
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
        }) => (
          <ExamReviewPanel
            q={q}
            currentIdx={currentIdx}
            navList={navList}
            reviewFilter={reviewFilter}
            results={results}
            answers={answers}
            flags={flags}
            onPrev={onPrev}
            onNext={onNext}
            onJump={onJump}
            onSetFilter={onSetFilter}
            onBackToResults={onBackToResults}
            onToggleFlag={onToggleFlag}
          />
        )}
      />
    </div>
  );
}
