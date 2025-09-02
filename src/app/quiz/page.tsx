"use client";

import React, { useEffect, useMemo, useState } from "react";

import QuestionCard from "@/components/QuestionCard";
import TimerDisplay from "@/components/TimerDisplay";
import { isGridCorrect } from "@/lib/helpers";

import type { Mode, Question } from "@/types";

/** ---------- Small utils ---------- */
const errMsg = (e: unknown) => (e instanceof Error ? e.message : String(e));

async function fetchJsonSafe<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { cache: "no-store", ...init });
  const raw = await res.text(); // robust against HTML error pages
  if (!res.ok) {
    throw new Error(raw || `HTTP ${res.status}`);
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error("Server did not return valid JSON.");
  }
}

type QuestionsPayload = { total: number; questions: Question[] };

/** ---------- Page Component ---------- */
export default function QuizPage() {
  // Config state
  const [count, setCount] = useState<number>(5);
  const [minutes, setMinutes] = useState<number>(10);
  const [randomize, setRandomize] = useState<boolean>(true);
  const [presetLabel, setPresetLabel] = useState<string | null>(null);

  // Session state
  const [mode, setMode] = useState<Mode>("CONFIG");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [timeRunning, setTimeRunning] = useState<boolean>(false);

  // Remember pre-preset config so Cancel can restore it
  const [savedConfig, setSavedConfig] = useState<{
    count: number;
    minutes: number;
  } | null>(null);

  // How many questions are available (caps the "count" input)
  const [maxCount, setMaxCount] = useState<number>(1);

  // Fetch available total once on mount
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await fetchJsonSafe<
          QuestionsPayload | { total?: number; questions?: unknown[] }
        >("/api/questions?count=0");
        const total =
          typeof (data as any)?.total === "number"
            ? Math.max(1, (data as any).total)
            : Math.max(1, ((data as any)?.questions?.length as number) || 1);
        if (alive) setMaxCount(total);
      } catch {
        if (alive) setMaxCount(1);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Keep count within [1, maxCount]
  useEffect(() => {
    setCount((c) => Math.max(1, Math.min(maxCount, c)));
  }, [maxCount]);

  const total = questions.length;

  function isQuestionCorrectLocal(q: Question, user?: string) {
    if (user == null || user === "") return false;
    if (q.type === "MULTIPLE_CHOICE") return user === q.answer;
    return isGridCorrect(user, q.answer);
  }

  const { correctCount, perQuestionCorrect } = useMemo(() => {
    let correct = 0;
    const per: Record<string, boolean> = {};
    for (const q of questions) {
      const user = answers[q.id];
      const ok =
        q.type === "MULTIPLE_CHOICE"
          ? user === q.answer
          : user != null
          ? isGridCorrect(user, q.answer)
          : false;
      per[q.id] = !!ok;
      if (ok) correct++;
    }
    return { correctCount: correct, perQuestionCorrect: per };
  }, [answers, questions]);

  /** Start a custom quiz (count/randomize) */
  const start = async () => {
    try {
      const data = await fetchJsonSafe<QuestionsPayload>(
        `/api/questions?count=${count}&randomize=${randomize}`
      );
      if (!data?.questions)
        throw new Error("Malformed response from /api/questions");
      setQuestions(data.questions);
      setAnswers({});
      setSubmitted(false);
      setPresetLabel(null);
      setMode("TEST");
      setTimeRunning(true);
    } catch (e) {
      console.error("start() error:", e);
      alert(`Could not start quiz: ${errMsg(e)}`);
    }
  };

  /** Submit the quiz */
  const submit = () => {
    setSubmitted(true);
    setTimeRunning(false);
    setMode("RESULTS");
  };

  /** Cancel current test and return to CONFIG */
  const cancelTest = () => {
    if (!window.confirm("Cancel this test? Your current answers will be lost."))
      return;

    if (savedConfig) {
      setCount(savedConfig.count);
      setMinutes(savedConfig.minutes);
      setSavedConfig(null);
    }

    setPresetLabel(null);
    setTimeRunning(false);
    setSubmitted(false);
    setQuestions([]);
    setAnswers({});
    setMode("CONFIG");
  };

  /** Reset to config (fresh state) */
  const resetToConfig = () => {
    setMode("CONFIG");
    setSubmitted(false);
    setQuestions([]);
    setAnswers({});
    setTimeRunning(false);
    setPresetLabel(null);
  };

  /** One-click full exam (57 Qs • 90 min) */
  const startShsatExam = async () => {
    try {
      // Save current config so Cancel can restore it later
      setSavedConfig({ count, minutes });

      const data = await fetchJsonSafe<QuestionsPayload>(
        `/api/questions?preset=shsat57`
      );
      if (!data?.questions?.length) throw new Error("No questions returned.");

      setQuestions(data.questions);
      setAnswers({});
      setCount(57);
      setMinutes(90);
      setPresetLabel("SHSAT Math Exam — 57 Questions • 90 min");
      setSubmitted(false);
      setMode("TEST");
      setTimeRunning(true);
    } catch (e) {
      console.error("startShsatExam error:", e);
      alert(`Could not start SHSAT exam: ${errMsg(e)}`);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-semibold">
            SHSAT Practice — Timed Quiz
          </h1>

          {mode !== "CONFIG" && (
            <div className="flex items-center gap-3">
              <TimerDisplay
                durationSec={Math.max(1, Math.round(minutes * 60))}
                running={timeRunning}
                onTimeUp={submit}
              />

              {mode === "TEST" ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={submit}
                    className="rounded-xl bg-black text-white px-4 py-2 text-sm shadow hover:bg-neutral-800"
                  >
                    Submit
                  </button>
                  <button
                    onClick={cancelTest}
                    className="rounded-xl border px-3 py-2 text-sm hover:bg-neutral-100"
                    title="Cancel this test and return to configuration"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={resetToConfig}
                  className="rounded-xl border px-3 py-2 text-sm hover:bg-neutral-100"
                >
                  New Quiz
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {mode === "CONFIG" && (
          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Configure Quiz</h2>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-1.5">
                <label className="text-sm text-neutral-600">
                  Number of Questions
                </label>
                <input
                  type="number"
                  min={1}
                  max={maxCount}
                  value={count}
                  onChange={(e) =>
                    setCount(
                      Math.max(
                        1,
                        Math.min(maxCount, Number(e.target.value) || 1)
                      )
                    )
                  }
                  className="rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-black"
                />
                <p className="text-xs text-neutral-500">
                  Max available: {maxCount}
                </p>
              </div>

              <div className="grid gap-1.5">
                <label className="text-sm text-neutral-600">
                  Time Limit (minutes)
                </label>
                <input
                  type="number"
                  min={1}
                  max={300}
                  value={minutes}
                  onChange={(e) =>
                    setMinutes(
                      Math.max(1, Math.min(300, Number(e.target.value) || 1))
                    )
                  }
                  className="rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="grid gap-1.5">
                <label className="text-sm text-neutral-600">
                  Randomize Questions
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setRandomize((s) => !s)}
                    className={[
                      "rounded-full px-3 py-1 text-sm border",
                      randomize
                        ? "bg-black text-white border-black"
                        : "bg-white text-neutral-800 hover:bg-neutral-50",
                    ].join(" ")}
                  >
                    {randomize ? "On" : "Off"}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={start}
                className="rounded-xl bg-black text-white px-4 py-2 text-sm shadow hover:bg-neutral-800 disabled:opacity-50"
              >
                Start Custom Quiz
              </button>

              <button
                type="button"
                onClick={startShsatExam}
                className="rounded-xl border px-4 py-2 text-sm hover:bg-neutral-100"
                title="57 questions with target mix + 90-minute timer"
              >
                SHSAT Math Exam (57 • 90)
              </button>

              {presetLabel && (
                <span className="text-xs rounded-full border px-3 py-1 bg-neutral-50">
                  {presetLabel}
                </span>
              )}
            </div>
          </section>
        )}

        {mode !== "CONFIG" && (
          <>
            {mode === "RESULTS" && (
              <section className="mb-6">
                <div className="rounded-2xl border bg-white p-5 shadow-sm">
                  <div className="text-lg font-semibold">
                    Score: {correctCount}/{total} (
                    {Math.round((correctCount / Math.max(1, total)) * 100)}%)
                  </div>
                </div>
              </section>
            )}

            <div className="grid gap-6">
              {questions.map((q) => (
                <QuestionCard
                  key={q.id}
                  q={q}
                  value={answers[q.id] ?? ""}
                  onChange={(val) => setAnswers((s) => ({ ...s, [q.id]: val }))}
                  reveal={mode === "RESULTS"}
                  isCorrect={
                    mode === "RESULTS" ? perQuestionCorrect[q.id] : undefined
                  }
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
