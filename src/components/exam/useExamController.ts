"use client";

import * as React from "react";
import { saveAnswer, submitExam } from "@/lib/exams-client";

/** ---------- Types ---------- */

export type ExamQuestion = {
  id: string;
  type: "MULTIPLE_CHOICE" | "FREE_RESPONSE";
  category?: string | null;
  stem: string;
  // DB stores media/choices as Json; your server already shaped them to this:
  media?: { type: "image"; url: string; alt?: string } | null;
  choices?: { key: string; text: string }[];
  // NOTE: we don't ship gold answers to the client during the attempt
  // answer?: string;
  examSet?: string | null;
};

export type ExamResultsData = {
  correct: number;
  total: number;
  // optional future expansions:
  byCategory?: Record<string, { correct: number; total: number }>;
  perQuestion?: {
    id: string;
    correct: boolean;
    user?: string | null;
    gold?: string | null;
  }[];
};

type ControllerArgs = {
  /** From server loader (page.tsx) */
  sessionId: string;
  minutes: number;
  questions: ExamQuestion[];

  /** Optional: if you implement resume, you can hydrate prior state */
  initialAnswers?: Record<string, string | null>;
  initialFlags?: Record<string, boolean>;
  initialSecondsLeft?: number; // from serverSecondsRemaining if you track it
};

/** ---------- Hook ---------- */

export function useExamController({
  sessionId,
  minutes,
  questions,
  initialAnswers,
  initialFlags,
  initialSecondsLeft,
}: ControllerArgs) {
  // core state
  const [currentIdx, setCurrentIdx] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, string | null>>(
    () => initialAnswers ?? {}
  );
  const [flags, setFlags] = React.useState<Record<string, boolean>>(
    () => initialFlags ?? {}
  );

  // timer
  const [secondsLeft, setSecondsLeft] = React.useState<number>(
    () => initialSecondsLeft ?? minutes * 60
  );
  React.useEffect(() => {
    if (secondsLeft <= 0) {
      // auto-submit when time runs out
      submit(true).catch(() => {});
      return;
    }
    const t = window.setInterval(
      () => setSecondsLeft((s) => Math.max(0, s - 1)),
      1000
    );
    return () => window.clearInterval(t);
  }, [secondsLeft]);

  // submitted/results
  const [submitted, setSubmitted] = React.useState(false);
  const [results, setResults] = React.useState<ExamResultsData | null>(null);

  // reviewing (post-submit flow, optional)
  const [reviewing, setReviewing] = React.useState(false);
  const [reviewFilter, setReviewFilter] = React.useState<
    "all" | "wrong" | "correct" | "flagged"
  >("wrong");

  // nav helpers
  const q = questions[currentIdx];
  const total = questions.length;
  const answeredCount = React.useMemo(
    () =>
      questions.reduce(
        (n, qq) =>
          answers[qq.id] != null && answers[qq.id] !== "" ? n + 1 : n,
        0
      ),
    [questions, answers]
  );
  const timePct = Math.max(
    0,
    Math.min(100, Math.round((secondsLeft / (minutes * 60)) * 100))
  );

  const navList = React.useMemo(() => {
    if (!reviewing) return questions.map((_, i) => i);
    // until you supply perQuestion correctness in results, default to "all"
    if (reviewFilter === "flagged") {
      return questions
        .map((q, i) => ({ q, i }))
        .filter(({ q }) => !!flags[q.id])
        .map(({ i }) => i);
    }
    return questions.map((_, i) => i);
  }, [questions, reviewing, reviewFilter, flags]);

  function go(i: number) {
    if (i >= 0 && i < total) setCurrentIdx(i);
  }
  function next() {
    const p = navList.indexOf(currentIdx);
    if (p >= 0 && p < navList.length - 1) setCurrentIdx(navList[p + 1]);
  }
  function prev() {
    const p = navList.indexOf(currentIdx);
    if (p > 0) setCurrentIdx(navList[p - 1]);
  }
  function skip() {
    next();
  }

  // keyboard shortcuts
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (submitted && !reviewing) return;
      if (reviewing) {
        if (e.key.toLowerCase() === "n") next();
        if (e.key.toLowerCase() === "p") prev();
        return;
      }
      if (!q) return;
      if (e.key.toLowerCase() === "n") next();
      if (e.key.toLowerCase() === "p") prev();
      if (e.key.toLowerCase() === "f") toggleFlag(q.id);
      if (e.key.toLowerCase() === "s" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        submit(false);
      }
      const keys = q.choices?.map((c) => c.key) ?? [];
      if (keys.length) {
        const idx = Number(e.key);
        if (!Number.isNaN(idx) && idx >= 1 && idx <= keys.length)
          setAnswer(q.id, keys[idx - 1]);
        const upper = e.key.toUpperCase();
        const pos = keys.findIndex((k) => k.toUpperCase() === upper);
        if (pos >= 0) setAnswer(q.id, keys[pos]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [q, submitted, reviewing, navList]);

  // ---------- autosave plumbing ----------
  const lastTickRef = React.useRef<number>(Date.now());
  const debTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

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
        // swallow; UI stays optimistic
        console.error("autosave failed", e);
      }
    }, 350);
  }

  function setAnswer(qid: string, val: string | null) {
    setAnswers((a) => ({ ...a, [qid]: val }));
    queueSave(qid, { answer: val });
  }
  function clearAnswer(qid: string) {
    setAnswers((prev) => {
      const next: Record<string, string | null> = { ...prev };
      delete next[qid];
      return next;
    });
    queueSave(qid, { answer: null });
  }
  function toggleFlag(qid: string) {
    setFlags((prev) => {
      const next = { ...prev, [qid]: !prev[qid] };
      queueSave(qid, { flagged: next[qid] });
      return next;
    });
  }

  // ---------- submit ----------
  async function submit(auto: boolean) {
    if (submitted) return;

    setSubmitted(true);
    try {
      const r = await submitExam(sessionId);
      // r: { ok: true, scoreCorrect, scoreTotal, submittedAt, minutes }
      const { scoreCorrect, scoreTotal } = r ?? {};
      if (typeof scoreCorrect === "number" && typeof scoreTotal === "number") {
        setResults({ correct: scoreCorrect, total: scoreTotal });
      }
    } catch (e) {
      console.error("submit failed", e);
    }
  }

  // ---------- review helpers ----------
  function startReview(filter: "all" | "wrong" | "correct" | "flagged") {
    setReviewFilter(filter);
    setReviewing(true);
    // pick first index in current navList
    const list =
      filter === "flagged"
        ? questions
            .map((q, i) => ({ q, i }))
            .filter(({ q }) => !!flags[q.id])
            .map(({ i }) => i)
        : questions.map((_, i) => i);
    setCurrentIdx(list[0] ?? 0);
  }
  function stopReview() {
    setReviewing(false);
  }

  return {
    // state/derived
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

    // stats
    answeredCount,
  };
}
