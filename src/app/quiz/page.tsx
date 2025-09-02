"use client";

import React, { useMemo, useState, useEffect } from "react";
import ChoiceGroup from "@/components/ChoiceGroup";
import QuestionCard from "@/components/QuestionCard";
import GridIn from "@/components/GridIn";
import { QUESTIONBANK } from "@/lib/data";
import type { Mode, Question } from "@/types";
import { pickQuestions, parseToNumber, isGridCorrect } from "@/lib/helpers";
import TimerDisplay from "@/components/TimerDisplay";
import { pickFromAllBanks } from "@/lib/database";
// --- Types

// --- Helpers: fraction/number parsing for grid-in answers

export default function QuizPage() {
  // --- Config state
  const [count, setCount] = useState<number>(5);
  const [minutes, setMinutes] = useState<number>(10);
  const [randomize, setRandomize] = useState<boolean>(true);
  const [presetLabel, setPresetLabel] = useState<string | null>(null);

  // --- Session state
  const [mode, setMode] = useState<Mode>("CONFIG");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [timeRunning, setTimeRunning] = useState<boolean>(false);
  // remember config if you start the preset exam so you can restore on cancel
  const [savedConfig, setSavedConfig] = useState<{
    count: number;
    minutes: number;
  } | null>(null);

  // NEW: how many questions are available across all files
  const [maxCount, setMaxCount] = useState<number>(1);

  // Fetch available total once (or whenever you need to refresh)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/questions?count=0", {
          cache: "no-store",
        });
        const data = await res.json();
        const total = Math.max(
          1,
          Number(data?.total ?? data?.questions?.length ?? 1)
        );
        if (alive) setMaxCount(total);
      } catch {
        if (alive) setMaxCount(1);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Keep count within [1, maxCount] whenever maxCount changes
  useEffect(() => {
    setCount((c) => Math.max(1, Math.min(maxCount, c)));
  }, [maxCount]);
  const total = questions.length;

  function isQuestionCorrect(q: Question, user?: string) {
    if (user == null || user === "") return false;
    if (q.type === "MULTIPLE_CHOICE") return user === q.answer;
    // uses your existing isGridCorrect
    return isGridCorrect(user, q.answer);
  }

  const { correctCount, perQuestionCorrect } = useMemo(() => {
    let correct = 0;
    const per: Record<string, boolean> = {};
    for (const q of questions) {
      const user = answers[q.id];
      if (q.type === "MULTIPLE_CHOICE") {
        const ok = user === q.answer;
        per[q.id] = !!ok;
        if (ok) correct++;
      } else {
        const ok = user != null ? isGridCorrect(user, q.answer) : false;
        per[q.id] = ok;
        if (ok) correct++;
      }
    }
    return { correctCount: correct, perQuestionCorrect: per };
  }, [answers, questions]);

  // const start = () => {
  //   const picked = pickFromAllBanks(count, randomize);
  //   setQuestions(picked);
  //   setAnswers({});
  //   setSubmitted(false);
  //   setMode("TEST");
  //   setTimeRunning(true);
  // };

  const start = async () => {
    try {
      const res = await fetch(
        `/api/questions?count=${count}&randomize=${randomize}`,
        { cache: "no-store" }
      );
      const raw = await res.text(); // read raw to inspect errors/HTML
      if (!res.ok) {
        console.error("Questions API failed:", res.status, raw);
        alert(`Failed to load questions (${res.status}). Check server logs.`);
        return;
      }
      const data = JSON.parse(raw);
      if (!data?.questions)
        throw new Error("Malformed response from /api/questions");

      setQuestions(data.questions);
      setAnswers({});
      setMode("TEST");
      setTimeRunning(true);
    } catch (e) {
      console.error("start() error:", e);
      alert(`Could not start quiz: ${e?.message ?? e}`);
    }
  };

  const submit = () => {
    setSubmitted(true);
    setTimeRunning(false);
    setMode("RESULTS");
  };

  const cancelTest = () => {
    if (!window.confirm("Cancel this test? Your current answers will be lost."))
      return;

    // restore previous config if present
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

  const resetToConfig = () => {
    setMode("CONFIG");
    setSubmitted(false);
    setQuestions([]);
    setAnswers({});
    setTimeRunning(false);
  };

  // one-click full exam (57 Qs • 90 min)
  const startShsatExam = async () => {
    try {
      const res = await fetch(`/api/questions?preset=shsat57`, {
        cache: "no-store",
      });
      const raw = await res.text();
      if (!res.ok) throw new Error(raw || `HTTP ${res.status}`);
      const data = JSON.parse(raw);
      if (!data?.questions?.length) throw new Error("No questions returned.");

      setQuestions(data.questions);
      setAnswers({});
      setCount(57); // reflect the configured exam size
      setMinutes(90); // 90-minute math exam window (your choice)
      setPresetLabel("SHSAT Math Exam — 57 Questions • 90 min");
      setMode("TEST");
      setTimeRunning(true);
    } catch (e) {
      console.error("startShsatExam error:", e);
      alert(`Could not start SHSAT exam: ${e?.message ?? e}`);
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
              {mode === "TEST" && (
                <div className="flex items-center gap-3">
                  {/* <TimerDisplay
                    durationSec={Math.max(1, Math.round(minutes * 60))}
                    running={timeRunning}
                    onTimeUp={submit}
                  /> */}
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
              )}
              {mode !== "TEST" && (
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
                disabled={/* your existing checks */ false}
                className="rounded-xl bg-black text-white px-4 py-2 text-sm shadow hover:bg-neutral-800 disabled:opacity-50"
              >
                Start Custom Quiz
              </button>

              {/* NEW: one-click official-style exam */}
              <button
                type="button"
                onClick={startShsatExam}
                className="rounded-xl border px-4 py-2 text-sm hover:bg-neutral-100"
                title="57 questions with target mix + 90-minute timer"
              >
                SHSAT Math Exam (57 • 90)
              </button>
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
              {questions.map((q, i) => (
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
