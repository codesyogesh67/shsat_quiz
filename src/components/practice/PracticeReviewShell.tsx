"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Flag,
  ListFilter,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import QuestionView from "@/components/practice/QuestionView";
import QuestionMap from "@/components/practice/QuestionMap";
import { ReviewBackButton } from "./ReviewBackButton";

type FilterKey = "all" | "wrong" | "correct" | "flagged";

type AttemptLike = {
  id?: string;
  sessionId?: string;
  questionId: string;
  givenAnswer?: string | null;
  answer?: string | null;
  selectedAnswer?: string | null;
  flagged?: boolean | null;
  isCorrect?: boolean | null;
  correct?: boolean | null;
};

type SessionLike = {
  id: string;
  label?: string | null;
  mode?: string | null;
};

type QuestionLike = {
  id: string;
  stem: string;
  answer?: string | null;
  correctAnswer?: string | null;
  choices?: string[];
  imageUrl?: string | null;
  [key: string]: unknown;
};

type Props = {
  sessionId: string;
  filter?: string;
  session: SessionLike;
  questions: QuestionLike[];
  attempts: AttemptLike[];
};

type ReviewItem = {
  question: QuestionLike;
  userAnswer: string;
  correctAnswer: string;
  flagged: boolean;
  isCorrect: boolean;
};

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "wrong", label: "Wrong" },
  { key: "correct", label: "Correct" },
  { key: "flagged", label: "Flagged" },
];

function normalizeFilter(value?: string): FilterKey {
  if (
    value === "all" ||
    value === "wrong" ||
    value === "correct" ||
    value === "flagged"
  ) {
    return value;
  }

  return "all";
}

function getAttemptAnswer(attempt?: AttemptLike) {
  if (!attempt) return "";
  return attempt.givenAnswer ?? attempt.answer ?? attempt.selectedAnswer ?? "";
}

function getQuestionAnswer(question: QuestionLike) {
  return question.correctAnswer ?? question.answer ?? "";
}

function buildReviewItems(
  questions: QuestionLike[],
  attempts: AttemptLike[]
): ReviewItem[] {
  const byQuestionId = new Map(attempts.map((a) => [a.questionId, a]));

  return questions.map((question) => {
    const attempt = byQuestionId.get(question.id);
    const userAnswer = getAttemptAnswer(attempt);
    const correctAnswer = getQuestionAnswer(question);
    const flagged = Boolean(attempt?.flagged);
    const derivedCorrect =
      attempt?.isCorrect ??
      attempt?.correct ??
      (!!userAnswer && !!correctAnswer && userAnswer === correctAnswer);

    return {
      question,
      userAnswer,
      correctAnswer,
      flagged,
      isCorrect: Boolean(derivedCorrect),
    };
  });
}

function applyFilter(items: ReviewItem[], filter: FilterKey) {
  switch (filter) {
    case "wrong":
      return items.filter((item) => item.userAnswer && !item.isCorrect);
    case "correct":
      return items.filter((item) => item.userAnswer && item.isCorrect);
    case "flagged":
      return items.filter((item) => item.flagged);
    default:
      return items;
  }
}

export default function PracticeReviewShell({
  sessionId,
  filter,
  session,
  questions,
  attempts,
}: Props) {
  const router = useRouter();

  const allItems = React.useMemo(() => buildReviewItems(questions, attempts), [
    questions,
    attempts,
  ]);

  const flags = React.useMemo(() => {
    return Object.fromEntries(
      allItems.map((item) => [item.question.id, item.flagged])
    );
  }, [allItems]);

  const answersForMap = React.useMemo(() => {
    return Object.fromEntries(
      allItems.map((item) => [item.question.id, item.userAnswer ?? ""])
    );
  }, [allItems]);

  const initialFilter = normalizeFilter(filter);
  const [activeFilter, setActiveFilter] = React.useState<FilterKey>(
    initialFilter
  );

  React.useEffect(() => {
    setActiveFilter(normalizeFilter(filter));
  }, [filter]);

  const filteredItems = React.useMemo(
    () => applyFilter(allItems, activeFilter),
    [allItems, activeFilter]
  );

  const [currentIdx, setCurrentIdx] = React.useState(0);

  React.useEffect(() => {
    setCurrentIdx(0);
  }, [activeFilter]);

  React.useEffect(() => {
    if (currentIdx > filteredItems.length - 1) {
      setCurrentIdx(0);
    }
  }, [filteredItems.length, currentIdx]);

  const currentItem = filteredItems[currentIdx];

  const stats = React.useMemo(() => {
    const answered = allItems.filter((item) => item.userAnswer).length;
    const correct = allItems.filter((item) => item.userAnswer && item.isCorrect)
      .length;
    const wrong = allItems.filter((item) => item.userAnswer && !item.isCorrect)
      .length;
    const flagged = allItems.filter((item) => item.flagged).length;
    const unanswered = allItems.length - answered;

    return {
      answered,
      correct,
      wrong,
      flagged,
      unanswered,
      total: allItems.length,
    };
  }, [allItems]);

  function goToFilter(nextFilter: FilterKey) {
    setActiveFilter(nextFilter);
    const params = new URLSearchParams(window.location.search);
    params.set("reviewSession", sessionId);
    params.set("filter", nextFilter);
    router.replace(`/practice?${params.toString()}`);
  }

  function goPrev() {
    setCurrentIdx((prev) => Math.max(prev - 1, 0));
  }

  function goNext() {
    setCurrentIdx((prev) => Math.min(prev + 1, filteredItems.length - 1));
  }

  function jumpToQuestion(questionId: string) {
    const nextIndex = filteredItems.findIndex(
      (item) => item.question.id === questionId
    );
    if (nextIndex >= 0) {
      setCurrentIdx(nextIndex);
    }
  }

  if (!allItems.length) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-6">
        <Card className="rounded-3xl border border-slate-200/70 bg-white shadow-sm">
          <CardContent className="p-8">
            <h1 className="text-2xl font-semibold text-slate-900">
              No review data found
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              This session does not have reviewable questions yet.
            </p>

            <div className="mt-6">
              <ReviewBackButton />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full max-w-[1500px] px-3 py-3 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-5">
          <div className="min-w-0">
            <Card className="overflow-hidden rounded-3xl border border-slate-200/70 bg-[radial-gradient(44rem_18rem_at_0%_0%,rgba(99,102,241,0.10),transparent_55%),radial-gradient(36rem_18rem_at_100%_0%,rgba(139,92,246,0.10),transparent_55%)] shadow-sm">
              <div className="px-4 py-4 sm:px-6 sm:py-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                        Practice Review
                      </span>

                      <span className="inline-flex items-center rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-xs font-medium text-slate-600">
                        {session.label || "Practice Session"}
                      </span>
                    </div>

                    <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                      Review Your Session
                    </h1>

                    <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
                      Revisit mistakes, check flagged questions, and learn from
                      each answer.
                    </p>
                  </div>

                  <ReviewBackButton />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
                  <div className="rounded-2xl border border-slate-200/70 bg-white/85 p-3 shadow-sm">
                    <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
                      Correct
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {stats.correct}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200/70 bg-white/85 p-3 shadow-sm">
                    <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
                      Wrong
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {stats.wrong}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200/70 bg-white/85 p-3 shadow-sm">
                    <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
                      Flagged
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {stats.flagged}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200/70 bg-white/85 p-3 shadow-sm">
                    <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
                      Unanswered
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {stats.unanswered}
                    </p>
                  </div>
                </div>
              </div>

              <CardContent className="p-3 sm:p-5">
                <div className="mb-2 block lg:hidden">
                  <div className="rounded-2xl border border-slate-200/70 bg-white/95 px-2.5 py-2 shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700">
                        <ListFilter className="h-3.5 w-3.5" />
                        Review Navigator
                      </div>

                      <div className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                        {filteredItems.length ? currentIdx + 1 : 0}/
                        {filteredItems.length}
                      </div>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {FILTERS.map((item) => {
                        const active = item.key === activeFilter;

                        return (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() => goToFilter(item.key)}
                            className={
                              active
                                ? "rounded-lg border border-indigo-200 bg-indigo-50 px-2 py-1 text-[10px] font-medium text-indigo-700"
                                : "rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-600"
                            }
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>

                    <div className="my-2 h-px bg-slate-200/70" />

                    <div className="[&_button]:m-0 [&_button]:h-7 [&_button]:w-7 [&_button]:rounded-md [&_button]:p-0 [&_button]:text-[10px] [&_button]:font-medium">
                      <QuestionMap
                        questions={
                          filteredItems.map((item) => item.question) as never
                        }
                        currentIdx={currentIdx}
                        answers={Object.fromEntries(
                          filteredItems.map((item) => [
                            item.question.id,
                            item.userAnswer || "",
                          ])
                        )}
                        flags={Object.fromEntries(
                          filteredItems.map((item) => [
                            item.question.id,
                            item.flagged,
                          ])
                        )}
                        onJump={(idx: number) => setCurrentIdx(idx)}
                      />
                    </div>
                  </div>
                </div>

                {currentItem ? (
                  <>
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className={
                            currentItem.isCorrect
                              ? "inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                              : currentItem.userAnswer
                              ? "inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700"
                              : "inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600"
                          }
                        >
                          {currentItem.isCorrect ? (
                            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                          ) : (
                            <CircleAlert className="mr-1.5 h-3.5 w-3.5" />
                          )}
                          {currentItem.isCorrect
                            ? "Correct"
                            : currentItem.userAnswer
                            ? "Incorrect"
                            : "Unanswered"}
                        </span>

                        {currentItem.flagged ? (
                          <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                            <Flag className="mr-1.5 h-3.5 w-3.5" />
                            Flagged
                          </span>
                        ) : null}
                      </div>

                      <div className="text-xs font-medium text-slate-500">
                        Question {currentIdx + 1} of {filteredItems.length}
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-sm">
                      <div className="border-b border-slate-200/70 bg-slate-50/70 px-4 py-3 sm:px-6">
                        <p className="text-sm font-semibold text-slate-900">
                          Review Question
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Compare your answer with the correct one and review
                          where needed.
                        </p>
                      </div>

                      <div className="p-4 sm:p-6">
                        <QuestionView
                          mode="review"
                          question={currentItem.question as never}
                          value={currentItem.userAnswer || ""}
                          onChange={() => {}}
                          onClear={() => {}}
                          onFlag={() => {}}
                          correctAnswer={currentItem.correctAnswer}
                          userAnswer={currentItem.userAnswer}
                        />
                      </div>

                      <div className="border-t border-slate-200/70 bg-slate-50/50 px-4 py-3 sm:px-6">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-2xl border border-slate-200/70 bg-white px-4 py-3">
                            <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                              Your Answer
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-900">
                              {currentItem.userAnswer || "No answer selected"}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-slate-200/70 bg-white px-4 py-3">
                            <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                              Correct Answer
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-900">
                              {currentItem.correctAnswer || "Not available"}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={goPrev}
                            disabled={currentIdx === 0}
                            className="rounded-xl"
                          >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Previous
                          </Button>

                          <Button
                            type="button"
                            onClick={goNext}
                            disabled={currentIdx >= filteredItems.length - 1}
                            className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:opacity-95"
                          >
                            Next
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>

                        <div className="mt-3 flex items-center justify-end lg:hidden">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push("/practice")}
                            className="rounded-xl"
                          >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Back to Practice
                          </Button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
                    <p className="text-sm font-medium text-slate-900">
                      No questions in this filter
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      Try another review filter to see questions.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <aside className="hidden lg:block">
            <Card className="sticky top-24 rounded-3xl border border-slate-200/70 bg-white/90 shadow-sm backdrop-blur-xl">
              <CardContent className="p-4">
                <div className="mb-3">
                  <h2 className="text-sm font-semibold text-slate-900">
                    Review Navigator
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Filter reviewed questions and jump directly to any item.
                  </p>
                </div>

                <div className="mb-4 flex flex-wrap gap-2">
                  {FILTERS.map((item) => {
                    const active = item.key === activeFilter;

                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => goToFilter(item.key)}
                        className={
                          active
                            ? "rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-700"
                            : "rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                        }
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>

                <QuestionMap
                  questions={
                    filteredItems.map((item) => item.question) as never
                  }
                  currentIdx={currentIdx}
                  answers={Object.fromEntries(
                    filteredItems.map((item) => [
                      item.question.id,
                      item.userAnswer || "",
                    ])
                  )}
                  flags={Object.fromEntries(
                    filteredItems.map((item) => [
                      item.question.id,
                      item.flagged,
                    ])
                  )}
                  onJump={(idx: number) => setCurrentIdx(idx)}
                />

                <div className="mt-4 border-t border-slate-200/70 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/practice")}
                    className="w-full rounded-2xl"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Back to Practice
                  </Button>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
