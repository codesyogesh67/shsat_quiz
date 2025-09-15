"use client";

import React, { useEffect, useMemo, useState } from "react";

import QuestionCard from "@/components/QuestionCard";
import TimerDisplay from "@/components/TimerDisplay";
import { isGridCorrect } from "@/lib/helpers";
import { examKeys } from "@/lib/data";

import type { Mode, Question } from "@/types";

/** ---------- Small utils ---------- */
const errMsg = (e: unknown) => (e instanceof Error ? e.message : String(e));

type ExamMeta = { label?: string; minutes?: number };
type ExamPayload = { meta?: ExamMeta; questions: Question[] };

async function fetchJsonSafe<T = unknown>(
  url: string,
  init?: RequestInit
): Promise<T> {
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

// Type guards to avoid `any`
type WithTotal = { total: number };
type WithQuestionsUnknown = { questions: unknown[] };

function isWithTotal(v: unknown): v is WithTotal {
  return (
    typeof v === "object" &&
    v !== null &&
    "total" in v &&
    typeof (v as Record<string, unknown>).total === "number"
  );
}
function isWithQuestionsUnknown(v: unknown): v is WithQuestionsUnknown {
  return (
    typeof v === "object" &&
    v !== null &&
    "questions" in v &&
    Array.isArray((v as Record<string, unknown>).questions)
  );
}

function numFromId(id: string): number | null {
  const m = id.match(/\d+/);
  return m ? Number(m[0]) : null;
}

/** ---------- Page Component ---------- */
export default function QuizPage() {
  // Config state
  const [count, setCount] = useState<number>(5);
  const [minutes, setMinutes] = useState<number>(10);
  const [randomize, setRandomize] = useState<boolean>(true);
  const [presetLabel, setPresetLabel] = useState<string | null>(null);
  const [currentExamKey, setCurrentExamKey] = useState<string | null>(null);

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
        const data = await fetchJsonSafe<unknown>("/api/questions?count=0");
        let total = 1;
        if (isWithTotal(data)) {
          total = Math.max(1, data.total);
        } else if (isWithQuestionsUnknown(data)) {
          total = Math.max(1, data.questions.length);
        }
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

  async function startExamByKey(examKey: string) {
    try {
      const data = await fetchJsonSafe<ExamPayload>(
        `/api/questions?exam=${examKey}`
      );
      if (!data?.questions?.length) throw new Error("No questions returned.");

      // Prefer minutes from file meta, else keep current
      const m = Math.max(1, Math.round((data.meta?.minutes ?? minutes) || 90));
      setQuestions(data.questions);
      setAnswers({});
      setCount(data.questions.length);
      setMinutes(90);
      setPresetLabel(
        data.meta?.label ?? examKey.replace(/_/g, " ").toUpperCase()
      );
      setSubmitted(false);
      setMode("TEST");
      setTimeRunning(true);

      setCurrentExamKey(examKey);
    } catch (e) {
      console.error("startExamByKey error:", e);
      alert(`Could not start exam: ${errMsg(e)}`);
    }
  }

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
      setCurrentExamKey(null);
    } catch (e) {
      console.error("start() error:", e);
      alert(`Could not start quiz: ${errMsg(e)}`);
    }
  };

  /** Submit the quiz */
  const submit = async () => {
    try {
      const hasEmpty = questions.some(
        (q) => !q.answer || q.answer.trim() === ""
      );
      if (hasEmpty && currentExamKey) {
        const data = await fetchJsonSafe<{
          exam: string;
          total: number;
          answers: { index: number; answer: string }[];
        }>(`/api/answers?exam=${currentExamKey}`);

        // Build a lookup keyed by the *real* question number (58..114)
        const byNumber = new Map<number, string>(
          data.answers.map((a) => [a.index, String(a.answer)])
        );

        // Build merged array *synchronously* then commit before RESULTS
        const merged = questions.map((q) => {
          if (q.answer && q.answer.trim() !== "") return q;

          // 1) try by displayed index (works when your JSON has 58..114)
          let ans = byNumber.get(q.index);
          if (!ans) {
            // 2) fallback: pull number from id "Q70" -> 70
            const n = numFromId(q.id);
            if (n != null) ans = byNumber.get(n);
          }
          return ans ? { ...q, answer: ans } : q;
        });

        // Ensure React commits before flipping modes
        const { flushSync } = await import("react-dom");
        flushSync(() => setQuestions(merged));
      }
    } catch (e) {
      console.warn("Could not load answer key on submit:", e);
    } finally {
      setSubmitted(true);
      setTimeRunning(false);
      setMode("RESULTS");
    }
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
    setCurrentExamKey(null);
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
      setCurrentExamKey(null);
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

            <div className="grid gap-4 sm:grid-cols-3 items-start">
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
        {mode === "CONFIG" && (
          <section className="mt-5 rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Exam Sets</h2>
            <p className="text-sm text-neutral-600 mb-3">
              Pick a specific past exam to practice. These load curated JSON
              sets from your data store.
            </p>

            <div className="flex flex-wrap gap-2">
              {examKeys.map((key) => (
                <button
                  key={key}
                  onClick={() => startExamByKey(key)}
                  className="rounded-xl border px-3 py-2 text-sm hover:bg-neutral-100"
                  title={`Load ${key}`}
                >
                  {key.replace("shsat_", "SHSAT ").toUpperCase()}
                </button>
              ))}
            </div>

            {presetLabel && (
              <div className="mt-3 text-xs rounded-full border px-3 py-1 bg-neutral-50 inline-block">
                {presetLabel}
              </div>
            )}
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
