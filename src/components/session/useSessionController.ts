"use client";

import * as React from "react";
import type {
  ExamQuestion,
  ReviewFilter,
  SessionResultsData,
} from "@/types/exam";

// type SessionResultsData = {
//   score: number;
//   correct: number;
//   incorrect: number;
//   unanswered: number;
//   accuracy: number;
//   byCategory: Record<
//     string,
//     {
//       total: number;
//       correct: number;
//       incorrect: number;
//       unanswered: number;
//       accuracy: number;
//     }
//   >;
//   perQuestion: Array<{
//     id: string;
//     index: number;
//     correct: boolean;
//     user?: string;
//     gold?: string;
//     category?: string;
//     flagged: boolean;
//   }>;
// };

export function useSessionController({
  questions,
  minutes,
}: {
  questions: ExamQuestion[];
  minutes: number;
}) {
  const safeQuestions = React.useMemo(() => questions ?? [], [questions]);
  const total = safeQuestions.length;

  const [currentIdx, setCurrentIdx] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [flags, setFlags] = React.useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = React.useState(false);
  const [reviewing, setReviewing] = React.useState(false);
  const [reviewFilter, setReviewFilter] = React.useState<ReviewFilter>("all");
  const [results, setResults] = React.useState<SessionResultsData | null>(null);
  const [secondsLeft, setSecondsLeft] = React.useState(
    Math.max(0, minutes * 60)
  );

  React.useEffect(() => {
    setSecondsLeft(Math.max(0, minutes * 60));
  }, [minutes]);

  React.useEffect(() => {
    if (!total) return;
    if (submitted || reviewing) return;

    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [submitted, reviewing, total]);

  const q = safeQuestions[currentIdx] ?? null;

  const answeredCount = React.useMemo(
    () =>
      safeQuestions.reduce(
        (count, question) => (answers[question.id] ? count + 1 : count),
        0
      ),
    [safeQuestions, answers]
  );

  const timePct = React.useMemo(() => {
    const totalSeconds = Math.max(1, minutes * 60);
    return Math.max(0, Math.min(100, (secondsLeft / totalSeconds) * 100));
  }, [secondsLeft, minutes]);

  const buildResults = React.useCallback((): SessionResultsData => {
    let correct = 0;
    let wrong = 0;
    let unanswered = 0;

    const byCategory: SessionResultsData["byCategory"] = {};
    const perQuestion: SessionResultsData["perQuestion"] = safeQuestions.map(
      (question, idx) => {
        const user = answers[question.id];
        const gold =
          typeof question.answer === "string" ? question.answer : undefined;
        const normalizedUser = typeof user === "string" ? user.trim() : "";
        const normalizedGold = typeof gold === "string" ? gold.trim() : "";
        const hasAnswer = normalizedUser.length > 0;
        const isCorrect =
          hasAnswer &&
          normalizedGold.length > 0 &&
          normalizedUser.toLowerCase() === normalizedGold.toLowerCase();

        if (!hasAnswer) unanswered += 1;
        else if (isCorrect) correct += 1;
        else wrong += 1;

        const category = question.category ?? "Uncategorized";
        if (!byCategory[category]) {
          byCategory[category] = {
            total: 0,
            correct: 0,
            wrong: 0,
            unanswered: 0,
            accuracy: 0,
          };
        }

        byCategory[category].total += 1;
        if (!hasAnswer) byCategory[category].unanswered += 1;
        else if (isCorrect) byCategory[category].correct += 1;
        else byCategory[category].wrong += 1;

        return {
          id: question.id,
          index: idx + 1,
          correct: isCorrect,
          user: user ?? undefined,
          gold: gold ?? undefined,
          category: question.category ?? undefined,
          flagged: !!flags[question.id],
        };
      }
    );

    Object.values(byCategory).forEach((entry) => {
      entry.accuracy =
        entry.total > 0 ? Math.round((entry.correct / entry.total) * 100) : 0;
    });

    const score = correct;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

    return {
      score,
      correct,
      wrong,
      unanswered,
      accuracy,
      byCategory,
      perQuestion,
      total,
    };
  }, [safeQuestions, answers, flags, total]);

  const finalizeSession = React.useCallback(() => {
    const computed = buildResults();
    setResults(computed);
    setSubmitted(true);
    setReviewing(false);
    return computed;
  }, [buildResults]);

  React.useEffect(() => {
    if (secondsLeft === 0 && !submitted && total > 0) {
      finalizeSession();
    }
  }, [secondsLeft, submitted, total, finalizeSession]);

  function setAnswer(value: string) {
    if (!q || submitted) return;
    setAnswers((prev) => ({
      ...prev,
      [q.id]: value,
    }));
  }

  function clearAnswer() {
    if (!q || submitted) return;
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[q.id];
      return next;
    });
  }

  function toggleFlag() {
    if (!q) return;
    setFlags((prev) => ({
      ...prev,
      [q.id]: !prev[q.id],
    }));
  }

  function go(index: number) {
    if (!total) return;
    setCurrentIdx(Math.max(0, Math.min(index, total - 1)));
  }

  function next() {
    if (!total) return;
    setCurrentIdx((prev) => Math.min(prev + 1, total - 1));
  }

  function prev() {
    if (!total) return;
    setCurrentIdx((prev) => Math.max(prev - 1, 0));
  }

  function skip() {
    next();
  }

  function submit(_auto = false) {
    finalizeSession();
  }

  function startReview() {
    if (!submitted) return;
    setReviewing(true);
    setCurrentIdx(0);
  }

  function stopReview() {
    setReviewing(false);
  }

  return {
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
    setReviewFilter,
  };
}
