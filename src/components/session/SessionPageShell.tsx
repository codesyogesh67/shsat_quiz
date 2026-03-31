"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SharedSessionShell from "@/components/session/SharedSessionShell";
import type { ExamQuestion, SessionResultsData } from "@/types/exam";
import SessionResultsCard from "@/components/session/SessionResults";
import SessionReviewShell from "@/components/session/SessionReviewShell";
import { useSessionController } from "./useSessionController";

type SessionMode = "practice" | "exam" | "diagnostic";
type ShellMode = "practice" | "exam" | "diagnostic";

function isSessionMode(value: string | null): value is SessionMode {
  return value === "practice" || value === "exam" || value === "diagnostic";
}

function toShellMode(mode: SessionMode): ShellMode {
  return mode;
}

function buildSessionId(args: {
  mode: SessionMode;
  category?: string;
  examKey?: string;
  count: number;
  minutes: number;
}) {
  const parts = [
    args.mode,
    args.category ?? "mixed",
    args.examKey ?? "default",
    String(args.count),
    String(args.minutes),
  ];

  return `session_${parts.join("_")}`;
}

export default function SessionPageShell() {
  const router = useRouter();
  const sp = useSearchParams();

  const rawMode = sp.get("mode");
  const mode: SessionMode = isSessionMode(rawMode) ? rawMode : "practice";
  const shellMode = toShellMode(mode);

  const category = sp.get("category") ?? undefined;
  const examKey = sp.get("examKey") ?? undefined;
  const count = Number(sp.get("count") ?? 20);
  const minutes = Number(sp.get("minutes") ?? 20);

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [questions, setQuestions] = React.useState<ExamQuestion[]>([]);

  React.useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.set("mode", mode);
        params.set("count", String(count));
        params.set("randomize", "true");

        if (category) params.set("category", category);
        if (examKey) params.set("examKey", examKey);

        const res = await fetch(`/api/questions?${params.toString()}`);

        if (!res.ok) {
          throw new Error(`Failed to load questions (${res.status})`);
        }

        const json = await res.json();

        if (ignore) return;

        setQuestions((json?.questions ?? []) as ExamQuestion[]);
      } catch (err) {
        if (!ignore) {
          setError(
            err instanceof Error ? err.message : "Failed to load session."
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      ignore = true;
    };
  }, [mode, category, examKey, count]);

  const sessionId = React.useMemo(
    () =>
      buildSessionId({
        mode,
        category,
        examKey,
        count,
        minutes,
      }),
    [mode, category, examKey, count, minutes]
  );

  const {
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
    submit,
    skip,
    startReview,
    stopReview,
  } = useSessionController({
    questions,
    minutes,
  });

  const normalizedResults = React.useMemo<SessionResultsData | null>(() => {
    if (!results) return null;
    const resultObj = (results as unknown) as Record<string, unknown>;

    const correct =
      typeof resultObj.correct === "number" ? resultObj.correct : 0;

    const wrong = typeof resultObj.wrong === "number" ? resultObj.wrong : 0;

    const unanswered =
      typeof resultObj.unanswered === "number" ? resultObj.unanswered : 0;

    const totalFromPerQuestion = Array.isArray(results.perQuestion)
      ? results.perQuestion.length
      : 0;

    const totalFromBreakdown = correct + wrong + unanswered;

    const resolvedTotal =
      totalFromPerQuestion > 0
        ? totalFromPerQuestion
        : totalFromBreakdown > 0
        ? totalFromBreakdown
        : questions.length;

    const accuracy =
      typeof results.accuracy === "number"
        ? results.accuracy
        : resolvedTotal > 0
        ? Math.round((correct / resolvedTotal) * 100)
        : 0;

    const byCategory: SessionResultsData["byCategory"] = Object.fromEntries(
      Object.entries(results.byCategory ?? {}).map(([key, value]) => {
        if (
          value &&
          typeof value === "object" &&
          "total" in value &&
          "correct" in value
        ) {
          const valueObj = value as Record<string, unknown>;

          const totalValue =
            typeof valueObj.total === "number" ? valueObj.total : 0;

          const correctValue =
            typeof valueObj.correct === "number" ? valueObj.correct : 0;

          const wrongValue =
            typeof valueObj.wrong === "number"
              ? valueObj.wrong
              : Math.max(totalValue - correctValue, 0);

          const unansweredValue =
            typeof valueObj.unanswered === "number" ? valueObj.unanswered : 0;

          const accuracyValue =
            typeof valueObj.accuracy === "number"
              ? valueObj.accuracy
              : totalValue > 0
              ? Math.round((correctValue / totalValue) * 100)
              : 0;
          return [
            key,
            {
              total: totalValue,
              correct: correctValue,
              wrong: wrongValue,
              unanswered: unansweredValue,
              accuracy: accuracyValue,
            },
          ];
        }

        if (typeof value === "number") {
          return [
            key,
            {
              total: 0,
              correct: 0,
              wrong: 0,
              unanswered: 0,
              accuracy: value,
            },
          ];
        }

        return [
          key,
          {
            total: 0,
            correct: 0,
            wrong: 0,
            unanswered: 0,
            accuracy: 0,
          },
        ];
      })
    );

    const perQuestion =
      results.perQuestion?.map((item, index) => ({
        id: item.id,
        index:
          typeof (item as { index?: unknown }).index === "number"
            ? (item as { index: number }).index
            : index + 1,
        correct: !!item.correct,
        user: item.user ?? undefined,
        gold: item.gold ?? undefined,
        category:
          typeof (item as { category?: unknown }).category === "string"
            ? (item as { category: string }).category
            : undefined,
        flagged:
          typeof (item as { flagged?: unknown }).flagged === "boolean"
            ? (item as { flagged: boolean }).flagged
            : false,
      })) ?? [];

    return {
      score: correct,
      accuracy,
      correct,
      wrong,
      unanswered,
      total: resolvedTotal,
      byCategory,
      perQuestion,
    };
  }, [results, questions.length]);

  const title =
    mode === "diagnostic"
      ? "SHSAT Diagnostic"
      : mode === "exam"
      ? "SHSAT Exam Simulation"
      : category
      ? `Practice — ${category}`
      : "SHSAT Practice";

  const subtitle =
    mode === "diagnostic"
      ? "A short timed assessment to evaluate your current level."
      : mode === "exam"
      ? "A full exam-style experience with structured timing."
      : category
      ? `Focused practice for ${category}.`
      : "Stay focused and build consistency through practice.";

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40">
        <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
          <div className="rounded-3xl border border-slate-200/70 bg-white p-8 shadow-sm">
            <p className="text-sm text-slate-500">Loading session...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40">
        <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
          <div className="rounded-3xl border border-slate-200/70 bg-white p-8 shadow-sm">
            <p className="text-sm text-rose-600">{error}</p>

            <button
              type="button"
              onClick={() => router.push("/practice")}
              className="mt-4 text-sm font-medium text-indigo-600 hover:underline"
            >
              Go back to Practice Center
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40">
        <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
          <div className="rounded-3xl border border-slate-200/70 bg-white p-8 shadow-sm">
            <p className="text-sm text-slate-500">
              No questions available for this selection.
            </p>

            <button
              type="button"
              onClick={() => router.push("/practice")}
              className="mt-4 text-sm font-medium text-indigo-600 hover:underline"
            >
              Back to Practice Center
            </button>
          </div>
        </div>
      </div>
    );
  }

  void q;
  void total;
  void sessionId;

  return (
    <SharedSessionShell
      mode={shellMode}
      title={title}
      subtitle={subtitle}
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
      results={normalizedResults}
      onAnswer={setAnswer}
      onClear={clearAnswer}
      onToggleFlag={toggleFlag}
      onJump={go}
      onPrev={prev}
      onNext={next}
      onSkip={skip}
      onSubmit={() => submit()}
      onStartReview={startReview}
      onStopReview={stopReview}
      onExit={() => router.push("/practice")}
      onRetake={() => router.push("/practice")}
      onPickAnother={() => router.push("/practice")}
      renderResults={({
        results,
        flags,
        onReview,
        onRetake,
        onPickAnother,
      }) => (
        <SessionResultsCard
          mode={mode}
          title="Session Complete"
          subtitle="Review your performance, revisit mistakes, and continue practicing with focus."
          results={results}
          flags={flags}
          onReview={onReview}
          onRetake={onRetake}
          onPickAnother={onPickAnother}
        />
      )}
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
        <SessionReviewShell
          q={q}
          questions={questions}
          currentIdx={currentIdx}
          answers={answers}
          flags={flags}
          reviewFilter={reviewFilter}
          results={results}
          onPrev={onPrev}
          onNext={onNext}
          onJump={onJump}
          onBackToResults={onBackToResults}
          onSetFilter={onSetFilter}
          onToggleFlag={onToggleFlag}
        />
      )}
    />
  );
}
