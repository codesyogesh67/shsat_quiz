// components/practice/PracticeShell.tsx
"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  Timer as TimerIcon,
  XCircle,
} from "lucide-react";
import QuestionView from "./QuestionView";
import QuestionMap from "./QuestionMap";
import TopicPicker from "./TopicPicker";

type Choice = { key: string; text: string };
type Media =
  | { type: "image"; url: string; alt?: string }
  | null;

export type Question = {
  id: string;
  index?: number;
  type: "MULTIPLE_CHOICE" | "FREE_RESPONSE";
  category?: string | null;
  stem: string; // may include HTML
  media?: Media;
  choices?: Choice[];
  answer?: string; // gold (if available)
};

type Answers = Record<string, string>; // qid -> choiceKey or numeric string
type PerQ = { id: string; correct: boolean; user?: string; gold?: string };

const DIAGNOSTIC_SECONDS = 12 * 60; // 12 minutes

export default function PracticeShell({
  initialMode,
    initialCount,
    initialData,

}: {
    initialMode: string;
    initialCount: number;
    initialData?: {
      mode: "TEST";
      questions: Question[];
      minutes: number;
      presetLabel: string | null;
      currentExamKey: string | null;
    } | null;
  }) {
  const router = useRouter();
  const sp = useSearchParams();

  // Derived mode flags
  const mode = (sp.get("mode") as string) ?? initialMode ?? "diagnostic";
  const category = (sp.get("category") as string) ?? null;
  const isDiagnostic = mode === "diagnostic";
  const isTopic = mode === "topic";
  const sessionLabel = isDiagnostic
    ? "Diagnostic"
    : `Practice${category ? ` — ${category}` : ""}`;
  
    const minutesParam = React.useMemo(() => {
      const raw = sp.get("minutes");
      const m = raw ? Number(raw) : NaN;
      return Number.isFinite(m) && m > 0 ? Math.min(300, Math.floor(m)) : null;
    }, [sp]);
  
    const DEFAULT_SECONDS = (minutesParam ?? 12) * 60; // fallback to 12 min

  // State
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [questions, setQuestions] = React.useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = React.useState(0);
  const [answers, setAnswers] = React.useState<Answers>({});
  const [flags, setFlags] = React.useState<Record<string, boolean>>({});
  const [secondsLeft, setSecondsLeft] = React.useState(DEFAULT_SECONDS);
  const [startedAt, setStartedAt] = React.useState<number | null>(null);

  const [submitted, setSubmitted] = React.useState(false);
  const [results, setResults] = React.useState<null | {
    correct: number;
    total: number;
    byCategory: Record<string, { correct: number; total: number }>;
    perQuestion?: PerQ[];
  }>(null);

  // Review mode
  const [reviewing, setReviewing] = React.useState(false);
  const [reviewFilter, setReviewFilter] =
      React.useState<"all" | "wrong" | "correct" | "flagged">("wrong");
    
    // hydrate immediately if server sent initialData ---
  React.useEffect(() => {
    if (!initialData) return;
    // We are starting directly in TEST mode from server
    setQuestions(initialData.questions ?? []);
    setAnswers({});
    setFlags({});
    setSubmitted(false);
    setResults(null);
    setReviewing(false);
    setCurrentIdx(0);
    setStartedAt(Date.now());

    const fromInitial = Math.max(1, Math.round(initialData.minutes * 60));
    setSecondsLeft((minutesParam ? minutesParam * 60 : fromInitial));
    setLoading(false); // skip loader
    // DIAGNOSTIC_SECONDS timer applies only to diagnostic flows; for exam sets we keep your current 12-min timer logic (or you can set minutes here if you time non-diagnostic too)
    // If you want to time non-diagnostic sessions using `initialData.minutes`, replace DIAGNOSTIC_SECONDS here accordingly.
  }, [initialData,minutesParam]);
    

  // Fetch questions when ready
    React.useEffect(() => {
      
        if (initialData?.mode === "TEST") {
            // Already hydrated by server; do not fetch.
            return;
          }
    let ignore = false;
    const count = Number(sp.get("count") ?? initialCount ?? 20);
    const modeQ = (sp.get("mode") as string) ?? initialMode ?? "diagnostic";
    const catQ = (sp.get("category") as string) ?? null;

    // Topic mode without a chosen category -> show TopicPicker (no fetch)
    if (modeQ === "topic" && !catQ) {
      setLoading(false);
      setQuestions([]);
      setCurrentIdx(0);
      setAnswers({});
      setFlags({});
      setResults(null);
      setSubmitted(false);
      setReviewing(false);
      setSecondsLeft(DEFAULT_SECONDS);
      setStartedAt(null);
      return () => {
        ignore = true;
      };
    }

    setLoading(true);
    setError(null);

    const urlStr =
      `/api/questions?mode=${encodeURIComponent(modeQ)}&count=${count}` +
      (modeQ === "topic" && catQ
        ? `&category=${encodeURIComponent(String(catQ))}`
        : "") +
      `&randomize=true`;

    fetch(urlStr)
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((j) => {
        if (ignore) return;
        const qs: Question[] = j?.questions ?? [];
        if (!qs.length) throw new Error("No questions returned");
        setQuestions(qs);
        setCurrentIdx(0);
        setAnswers({});
        setFlags({});
        setResults(null);
        setSubmitted(false);
        setReviewing(false);
        setSecondsLeft(DEFAULT_SECONDS);
        setStartedAt(Date.now());
      })
      .catch((e) => {
        if (!ignore) setError(e?.message ?? "Failed to load questions.");
      })
      .finally(() => !ignore && setLoading(false));

    return () => {
      ignore = true;
    };
  }, [sp, initialMode, initialCount,initialData]);

  // Timer (only in Diagnostic and while active)
  React.useEffect(() => {
    if (loading || submitted || reviewing || !isDiagnostic) return;
    if (secondsLeft <= 0) {
      handleSubmit(true);
      return;
    }
    const t = window.setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);
    return () => window.clearInterval(t);
  }, [loading, submitted, reviewing, secondsLeft, isDiagnostic]);

  // Keyboard shortcuts
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (submitted && !reviewing) return;

      // In review: nav only
      if (reviewing) {
        if (e.key.toLowerCase() === "n") next();
        if (e.key.toLowerCase() === "p") prev();
        return;
      }

      const q = questions[currentIdx];
      if (!q) return;

      // Navigate
      if (e.key.toLowerCase() === "n") next();
      if (e.key.toLowerCase() === "p") prev();

      // Flag
      if (e.key.toLowerCase() === "f") toggleFlag(q.id);

      // Submit (cmd/ctrl + s)
      if (e.key.toLowerCase() === "s" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleSubmit(false);
      }

      // Answer selection: digits 1..8, or A..H
      const keys = q.choices?.map((c) => c.key) ?? [];
      if (keys.length) {
        const idx = Number(e.key);
        if (!Number.isNaN(idx) && idx >= 1 && idx <= keys.length) {
          setAnswer(q.id, keys[idx - 1]);
        }
        const upper = e.key.toUpperCase();
        const pos = keys.findIndex((k) => k.toUpperCase() === upper);
        if (pos >= 0) setAnswer(q.id, keys[pos]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [questions, currentIdx, submitted, reviewing]);

  function setAnswer(qid: string, val: string) {
    setAnswers((a) => ({ ...a, [qid]: val }));
  }
  function clearAnswer(qid: string) {
    setAnswers((a) => {
      const { [qid]: _, ...rest } = a;
      return rest;
    });
  }
  function toggleFlag(qid: string) {
    setFlags((f) => ({ ...f, [qid]: !f[qid] }));
  }

  function go(i: number) {
    if (i >= 0 && i < questions.length) setCurrentIdx(i);
  }

  // Nav respecting review filter
  const navList = React.useMemo(() => {
    if (!reviewing) return questions.map((_, i) => i);
    return getIndicesForFilter(
      reviewFilter,
      questions,
      flags,
      results?.perQuestion
    );
  }, [reviewing, reviewFilter, questions, flags, results?.perQuestion]);

  function next() {
    const pos = navList.indexOf(currentIdx);
    if (pos >= 0 && pos < navList.length - 1) setCurrentIdx(navList[pos + 1]);
  }
  function prev() {
    const pos = navList.indexOf(currentIdx);
    if (pos > 0) setCurrentIdx(navList[pos - 1]);
  }
  function skip() {
    next();
  }

  function scoreLocally(): {
    correct: number;
    total: number;
    byCategory: Record<string, { correct: number; total: number }>;
    perQuestion: PerQ[];
  } {
    let correct = 0;
    const total = questions.length;
    const byCategory: Record<string, { correct: number; total: number }> = {};
    const perQuestion: PerQ[] = [];

    for (const q of questions) {
      const cat = (q.category ?? "Uncategorized").toString();
      byCategory[cat] ??= { correct: 0, total: 0 };
      byCategory[cat].total += 1;

      const user = answers[q.id];
      const gold = q.answer;
      const ok =
        gold != null &&
        user != null &&
        normalizeAns(user) === normalizeAns(gold);

      perQuestion.push({ id: q.id, correct: !!ok, user, gold });

      if (ok) {
        correct += 1;
        byCategory[cat].correct += 1;
      }
    }
    return { correct, total, byCategory, perQuestion };
  }

  async function handleSubmit(_autoFromTimer: boolean) {
    if (submitted) return;
    setSubmitted(true);

    try {
      const r = await fetch("/api/sessions/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: isDiagnostic ? "DIAGNOSTIC" : "TOPIC",
          category: isTopic ? category : undefined,
          questionIds: questions.map((q) => q.id),
          answers,
          startedAt,
        }),
      });
      if (r.ok) {
        const j = await r.json();
        const srv = j?.results;
        if (srv) {
          if (!srv.perQuestion) {
            const local = scoreLocally();
            srv.perQuestion = local.perQuestion;
          }
          setResults(srv);
          return;
        }
      }
    } catch {
      // ignore, fall back to local
    }
    setResults(scoreLocally());
  }

  function startReview(
    filter: "all" | "wrong" | "correct" | "flagged"
  ) {
    setReviewFilter(filter);
    setReviewing(true);
    const list = getIndicesForFilter(
      filter,
      questions,
      flags,
      results?.perQuestion
    );
    setCurrentIdx(list[0] ?? 0);
  }

  const q = questions[currentIdx];
  const answeredCount = questions.filter((qq) => answers[qq.id] != null).length;
  const timePct = Math.max(
    0,
    Math.min(100, Math.round((secondsLeft / Math.max(1, DEFAULT_SECONDS)) * 100))
  );

  // Topic mode with no category chosen -> show picker
  if (isTopic && !category) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Select a topic to start</CardTitle>
        </CardHeader>
        <CardContent>
          <TopicPicker
            defaultCount={10}
            onStart={(cat, cnt) => {
              const params = new URLSearchParams(sp.toString());
              params.set("mode", "topic");
              params.set("category", cat);
              params.set("count", String(cnt ?? 10));
              router.push(`/practice?${params.toString()}`);
            }}
          />
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading…</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={20} />
        </CardContent>
      </Card>
    );
  }
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{error}</p>
          <div className="mt-4">
            <Button onClick={() => router.refresh()}>Retry</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Results summary
  if (submitted && results && !reviewing) {
    const { correct, total, byCategory } = results;
    const accuracy = total ? Math.round((correct / total) * 100) : 0;
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {isDiagnostic ? "Diagnostic results" : "Practice results"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary">
              {correct} / {total} correct
            </Badge>
            <Badge className="font-semibold">{accuracy}% accuracy</Badge>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold">By category</h3>
            <div className="space-y-2">
              {Object.entries(byCategory).map(([cat, v]) => {
                const pct = v.total
                  ? Math.round((v.correct / v.total) * 100)
                  : 0;
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">{cat}</span>
                      <span className="text-muted-foreground">
                        {v.correct}/{v.total} ({pct}%)
                      </span>
                    </div>
                    <Progress value={pct} />
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          <Button onClick={() => startReview("wrong")}>Review mistakes</Button>
          <Button variant="outline" onClick={() => startReview("all")}>
            Review all
          </Button>
          <Button variant="outline" onClick={() => startReview("correct")}>
            Review correct
          </Button>
          <Button
            variant="outline"
            onClick={() => startReview("flagged")}
            disabled={!Object.values(flags).some(Boolean)}
          >
            Review flagged
          </Button>
          <div className="ml-auto flex gap-2">
            <Button
              onClick={() =>
                router.push(
                  isDiagnostic
                    ? "/practice?mode=diagnostic"
                    : `/practice?mode=topic${category ? `&category=${encodeURIComponent(category)}` : ""}`
                )
              }
            >
              {isDiagnostic ? "Retake diagnostic" : "Restart practice"}
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                router.push("/practice?mode=custom&from=diagnostic")
              }
            >
              Practice weak topics
            </Button>
          </div>
        </CardFooter>
      </Card>
    );
  }

  // Review mode
  if (submitted && results && reviewing && q) {
    const pq = results.perQuestion?.find((p) => p.id === q.id);
    const isCorrect = !!pq?.correct;

    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
        <Card>
          <CardHeader className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge variant={isCorrect ? "secondary" : "destructive"}>
                  {isCorrect ? "Correct" : "Incorrect"}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Question {currentIdx + 1} / {questions.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={reviewFilter === "wrong" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setReviewFilter("wrong")}
                >
                  Wrong
                </Button>
                <Button
                  variant={reviewFilter === "correct" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setReviewFilter("correct")}
                >
                  Correct
                </Button>
                <Button
                  variant={reviewFilter === "flagged" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setReviewFilter("flagged")}
                >
                  Flagged
                </Button>
                <Button
                  variant={reviewFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setReviewFilter("all")}
                >
                  All
                </Button>
              </div>
            </div>

            <Separator />

            <div className="text-xs text-muted-foreground">
              <span className="mr-3">
                Your answer:{" "}
                <span className="font-medium">{pq?.user ?? "—"}</span>
              </span>
              <span>
                Correct answer:{" "}
                <span className="font-medium">{pq?.gold ?? "—"}</span>
              </span>
            </div>
          </CardHeader>

          <CardContent>
            <QuestionView
              mode="review"
              question={q}
              value={answers[q.id] ?? ""}
              correctAnswer={pq?.gold}
              userAnswer={pq?.user}
              onChange={() => {}}
              onClear={() => {}}
              onFlag={() => toggleFlag(q.id)}
            />
          </CardContent>

          <CardFooter className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={prev}
                disabled={navList.indexOf(currentIdx) <= 0}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Prev
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={next}
                disabled={navList.indexOf(currentIdx) === navList.length - 1}
              >
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setReviewing(false)}
              >
                Back to results
              </Button>
            </div>
          </CardFooter>
        </Card>

        <aside className="lg:sticky lg:top-20">
          <QuestionMap
            questions={questions}
            currentIdx={currentIdx}
            answers={answers}
            flags={flags}
            onJump={go}
          />
        </aside>
      </div>
    );
  }

  // Active test/practice view
  const answeredCountLabel = `Question ${currentIdx + 1} / ${questions.length} · Answered ${answeredCount}`;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {isDiagnostic ? (
              <div className="flex items-center gap-3">
                <TimerIcon className="h-4 w-4" />
                <span className="font-mono tabular-nums">
                  {formatTime(secondsLeft)}
                </span>
                <div className="w-32">
                  <Progress value={timePct} />
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">{sessionLabel}</div>
            )}

            <div className="text-sm text-muted-foreground">
              {answeredCountLabel}
            </div>

            <div className="flex items-center gap-2">
              <ExitConfirm onConfirm={() => router.push("/")} />
              <SubmitConfirm onConfirm={() => handleSubmit(false)} />
            </div>
          </div>

          <Separator />

          <div className="flex items-center gap-2">
            {q?.category && <Badge variant="secondary">{q.category}</Badge>}
            {flags[q?.id ?? ""] && (
              <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                <Flag className="h-3.5 w-3.5" /> Marked
              </span>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {q && (
            <QuestionView
              mode="test"
              question={q}
              value={answers[q.id] ?? ""}
              onChange={(val) => setAnswer(q.id, val)}
              onClear={() => clearAnswer(q.id)}
              onFlag={() => toggleFlag(q.id)}
            />
          )}
        </CardContent>

        <CardFooter className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prev}
              disabled={currentIdx === 0}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={skip}
              disabled={currentIdx >= questions.length - 1}
            >
              Skip
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => toggleFlag(q.id)}
            >
              <Flag className="mr-1 h-4 w-4" />
              {flags[q?.id] ? "Unmark" : "Mark for review"}
            </Button>
            <Button
              size="sm"
              onClick={next}
              disabled={currentIdx >= questions.length - 1}
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      <aside className="lg:sticky lg:top-20">
        <QuestionMap
          questions={questions}
          currentIdx={currentIdx}
          answers={answers}
          flags={flags}
          onJump={go}
        />
      </aside>
    </div>
  );
}

/* ---------- helpers ---------- */

function normalizeAns(s: string) {
  return String(s).trim().toUpperCase();
}

function formatTime(sec: number) {
  const m = Math.floor(Math.max(0, sec) / 60);
  const s = Math.max(0, sec) % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function ExitConfirm({ onConfirm }: { onConfirm: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          <XCircle className="mr-1 h-4 w-4" />
          Exit
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Exit session?</AlertDialogTitle>
          <AlertDialogDescription>
            Your progress will be lost unless you submit first.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Stay</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Exit</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function SubmitConfirm({ onConfirm }: { onConfirm: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm">Submit</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Submit answers?</AlertDialogTitle>
          <AlertDialogDescription>
            You won’t be able to change answers after submission.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep working</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Submit</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function getIndicesForFilter(
  filter: "all" | "wrong" | "correct" | "flagged",
  questions: Question[],
  flags: Record<string, boolean>,
  perQuestion?: PerQ[]
) {
  const statusById = new Map<string, PerQ>();
  (perQuestion ?? []).forEach((p) => statusById.set(p.id, p));

  return questions
    .map((q, i) => ({ q, i, s: statusById.get(q.id) }))
    .filter(({ q, s }) => {
      if (filter === "all") return true;
      if (filter === "flagged") return !!flags[q.id];
      if (!s) return false;
      if (filter === "wrong") return !s.correct;
      if (filter === "correct") return !!s.correct;
      return true;
    })
    .map(({ i }) => i);
}
