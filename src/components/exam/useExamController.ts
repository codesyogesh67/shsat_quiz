"use client";

import * as React from "react";
import { saveAnswer, submitExam } from "@/lib/exams-client";
import type {
  ExamQuestion,
  ReviewFilter,
  SessionResultsData,
} from "@/types/exam";

type ControllerArgs = {
  sessionId: string;
  minutes: number;
  questions: ExamQuestion[];
  initialAnswers?: Record<string, string | null>;
  initialFlags?: Record<string, boolean>;
  initialSecondsLeft?: number;
};

export function useExamController({
  sessionId,
  minutes,
  questions = [],
  initialAnswers,
  initialFlags,
  initialSecondsLeft,
}: ControllerArgs) {
  const [currentIdx, setCurrentIdx] = React.useState(0);

  const [answers, setAnswers] = React.useState<Record<string, string | null>>(
    () => initialAnswers ?? {}
  );

  const [flags, setFlags] = React.useState<Record<string, boolean>>(
    () => initialFlags ?? {}
  );

  const [secondsLeft, setSecondsLeft] = React.useState(
    () => initialSecondsLeft ?? Math.max(0, minutes * 60)
  );

  const [submitted, setSubmitted] = React.useState(false);
  const [results, setResults] = React.useState<SessionResultsData | null>(null);

  const [reviewing, setReviewing] = React.useState(false);
  const [reviewFilter, setReviewFilter] = React.useState<ReviewFilter>("wrong");

  const lastTickRef = React.useRef(Date.now());
  const debTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  async function flushTime(qid: string) {
    const now = Date.now();
    const delta = Math.floor((now - lastTickRef.current) / 1000);
    lastTickRef.current = now;

    if (delta <= 0) return;

    try {
      await saveAnswer(sessionId, {
        questionId: qid,
        timeSpentDeltaSec: delta,
      });
    } catch (e) {
      console.error("flushTime failed", e);
    }
  }

  const q = questions[currentIdx];
  const total = questions.length;

  React.useEffect(() => {
    if (secondsLeft <= 0) return;

    const t = window.setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);

    return () => window.clearInterval(t);
  }, [secondsLeft]);

  const answeredCount = React.useMemo(
    () =>
      questions.reduce((n, qq) => {
        const value = answers[qq.id];
        return value != null && value !== "" ? n + 1 : n;
      }, 0),
    [questions, answers]
  );

  const totalDurationSec = Math.max(1, minutes * 60);

  const timePct = Math.max(
    0,
    Math.min(100, Math.round((secondsLeft / totalDurationSec) * 100))
  );

  const navList = React.useMemo(() => {
    if (!reviewing) return questions.map((_, i) => i);

    if (reviewFilter === "flagged") {
      return questions
        .map((question, i) => ({ question, i }))
        .filter(({ question }) => !!flags[question.id])
        .map(({ i }) => i);
    }

    return questions.map((_, i) => i);
  }, [questions, reviewing, reviewFilter, flags]);

  const go = (i: number) => {
    const cur = questions[currentIdx]?.id;
    if (cur) void flushTime(cur);
    if (i >= 0 && i < total) setCurrentIdx(i);
  };

  const next = () => {
    const cur = questions[currentIdx]?.id;
    if (cur) void flushTime(cur);

    const p = navList.indexOf(currentIdx);
    if (p >= 0 && p < navList.length - 1) {
      setCurrentIdx(navList[p + 1]);
    }
  };

  const prev = () => {
    const cur = questions[currentIdx]?.id;
    if (cur) void flushTime(cur);

    const p = navList.indexOf(currentIdx);
    if (p > 0) {
      setCurrentIdx(navList[p - 1]);
    }
  };

  const skip = () => next();

  function queueSave(
    qid: string,
    payload: { answer?: string | null; flagged?: boolean }
  ) {
    if (debTimer.current) clearTimeout(debTimer.current);

    debTimer.current = setTimeout(async () => {
      const now = Date.now();
      const delta = Math.floor((now - lastTickRef.current) / 1000);
      lastTickRef.current = now;

      try {
        await saveAnswer(sessionId, {
          questionId: qid,
          timeSpentDeltaSec: Math.max(0, delta),
          ...payload,
        });
      } catch (e) {
        console.error("autosave failed", e);
      }
    }, 350);
  }

  const setAnswer = (qid: string, val: string | null) => {
    setAnswers((prev) => ({ ...prev, [qid]: val }));
    queueSave(qid, { answer: val });
  };

  const clearAnswer = (qid: string) => {
    setAnswers((prev) => {
      const nextState = { ...prev };
      delete nextState[qid];
      return nextState;
    });

    queueSave(qid, { answer: null });
  };

  const toggleFlag = (qid: string) => {
    setFlags((prev) => {
      const nextState = { ...prev, [qid]: !prev[qid] };
      queueSave(qid, { flagged: nextState[qid] });
      return nextState;
    });
  };

  const submit = async () => {
    if (submitted) return { ok: true };

    const cur = questions[currentIdx]?.id;
    if (cur) await flushTime(cur);

    try {
      const r = await submitExam(sessionId);

      if (!r?.ok) return { ok: false };

      const correct = r.scoreCorrect ?? 0;
      const totalQ = r.scoreTotal ?? 0;
      const wrong = Math.max(totalQ - correct, 0);
      const unanswered = Math.max(totalQ - answeredCount, 0);
      const accuracy = totalQ > 0 ? Math.round((correct / totalQ) * 100) : 0;

      const result: SessionResultsData = {
        score: correct,
        accuracy,
        correct,
        wrong,
        unanswered,
        total: totalQ,
        byCategory: {},
        perQuestion: [],
      };

      setResults(result);
      setSubmitted(true);

      return { ok: true };
    } catch (e) {
      console.error("submit failed", e);
      return { ok: false };
    }
  };

  const startReview = (filter: ReviewFilter) => {
    setReviewFilter(filter);
    setReviewing(true);
    setCurrentIdx(0);
  };

  const stopReview = () => setReviewing(false);

  return {
    questions,
    currentIdx,
    q,
    total,
    answers,
    flags,
    secondsLeft,
    timePct,
    submitted,
    results,
    reviewing,
    reviewFilter,
    navList,
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
    answeredCount,
  };
}
