// components/LandingTeaserQuestion.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type Choice = { key: string; text: string };
type Media = { type: "image"; url: string; alt?: string } | null;
type Question = {
  id: string;
  type: "MULTIPLE_CHOICE" | "FREE_RESPONSE";
  category?: string | null;
  stem: string;
  media?: Media;
  choices?: Choice[];
  answer?: string;
};

function normalizeAns(s: string) {
  return String(s).trim().toUpperCase();
}

export default function LandingTeaserQuestion() {
  const router = useRouter();

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [q, setQ] = React.useState<Question | null>(null);

  const [revealed, setRevealed] = React.useState(false);
  const [value, setValue] = React.useState<string>("");
  const [submitted, setSubmitted] = React.useState(false);
  const [isCorrect, setIsCorrect] = React.useState<boolean | null>(null);

  async function fetchRandomQuestion() {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/questions?count=1&randomize=true");
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = await r.json();
      const qs: Question[] = Array.isArray(j?.questions) ? j.questions : [];
      let first = qs[0] ?? null;

      // ✅ if API didn't return a valid question, use a fallback
      if (!first || !first.choices?.length) {
        first = {
          id: "default_1",
          type: "MULTIPLE_CHOICE",
          category: "Number Properties",
          stem: "If 5x + 3 = 18, what is the value of x?",
          choices: [
            { key: "A", text: "2" },
            { key: "B", text: "3" },
            { key: "C", text: "4" },
            { key: "D", text: "5" },
          ],
          answer: "C",
        };
      }

      setQ(first);
      setValue("");
      setSubmitted(false);
      setIsCorrect(null);
    } catch (e) {
      // ✅ fallback also applies if fetch fails entirely
      const fallback: Question = {
        id: "default_fallback",
        type: "MULTIPLE_CHOICE",
        category: "Basic Arithmetic",
        stem: "What is 7 + 8?",
        choices: [
          { key: "A", text: "13" },
          { key: "B", text: "14" },
          { key: "C", text: "15" },
          { key: "D", text: "16" },
        ],
        answer: "C",
      };
      setQ(fallback);
      setError(null); // don’t show red error text
    } finally {
      setLoading(false);
    }
  }

  // Load once on mount
  React.useEffect(() => {
    fetchRandomQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function submit() {
    if (!q || !value) return;
    const ok =
      q.answer != null && normalizeAns(value) === normalizeAns(q.answer);
    setIsCorrect(ok);
    setSubmitted(true);
  }

  const startQuick = (count: number, minutes: number) => {
    const qs = new URLSearchParams({
      count: String(Math.max(1, count)),
      minutes: String(Math.max(1, minutes)),
    });
    router.push(`/practice/random?${qs.toString()}`);
  };

  const answered = !!value;
  const showFeedback = submitted && isCorrect != null;

  /* ---------- Header Toolbar ---------- */
  function HeaderToolbar() {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base sm:text-lg">
            Practice Question
          </CardTitle>
          {q?.category ? <Badge variant="secondary">{q.category}</Badge> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => startQuick(5, 8)}>
            Quick 5
          </Button>
          <Button size="sm" onClick={() => startQuick(10, 15)}>
            Quick 10
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => startQuick(57, 90)}
          >
            Full SHSAT
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              await fetchRandomQuestion();
              setRevealed(false); // go back to the reveal state (no footer button)
            }}
          >
            Random question
          </Button>
        </div>
      </div>
    );
  }

  /* ---------- Loading / Error ---------- */
  if (loading) {
    return (
      <Card className="shadow-sm relative overflow-hidden border-indigo-200">
        {/* colorful soft glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(80rem_40rem_at_20%_-10%,theme(colors.indigo.400/.12),transparent),radial-gradient(60rem_30rem_at_120%_110%,theme(colors.fuchsia.400/.10),transparent)]"
        />
        <CardHeader className="space-y-3">
          <HeaderToolbar />
          <Separator />
        </CardHeader>
        <CardContent>
          <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
          <div className="mt-3 h-4 w-5/6 animate-pulse rounded bg-muted" />
          <div className="mt-6 grid gap-2">
            <div className="h-9 w-64 animate-pulse rounded bg-muted" />
            <div className="h-9 w-72 animate-pulse rounded bg-muted" />
            <div className="h-9 w-60 animate-pulse rounded bg-muted" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !q) {
    return (
      <Card className="shadow-sm relative overflow-hidden border-rose-200">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(70rem_30rem_at_50%_-10%,theme(colors.rose.400/.12),transparent)]"
        />
        <CardHeader className="space-y-3">
          <HeaderToolbar />
          <Separator />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">
            {error ?? "Could not load a question."}
          </p>
          <div className="mt-4">
            <Button variant="outline" onClick={fetchRandomQuestion}>
              Try again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  /* ---------- Main ---------- */
  return (
    <Card className="shadow-sm relative overflow-hidden border-violet-200">
      {/* Colorful gradient backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(90rem_40rem_at_10%_-20%,theme(colors.indigo.500/.10),transparent),radial-gradient(80rem_40rem_at_120%_120%,theme(colors.fuchsia.500/.10),transparent)]"
      />
      {/* Accent ring on top edge */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-purple-500" />

      <CardHeader className="space-y-3">
        <HeaderToolbar />
        <Separator />
      </CardHeader>

      <CardContent className="space-y-4">
        {/* REVEAL AREA */}
        {!revealed ? (
          <div className="flex flex-col items-center justify-center rounded-xl border bg-background/60 p-6 text-center">
            <div className="text-sm text-muted-foreground mb-3">
              Do you want to give a try to{" "}
              <span className="font-medium">today&apos;s question</span>?
            </div>
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="group relative inline-flex h-24 w-24 items-center justify-center rounded-full border-2 border-indigo-300 bg-white text-indigo-700 shadow hover:shadow-md transition"
              aria-label="Reveal today's question"
            >
              <span className="absolute -inset-1 rounded-full bg-gradient-to-tr from-indigo-200/40 via-fuchsia-200/40 to-purple-200/40 blur-lg" />
              <span className="relative text-sm font-semibold">Reveal</span>
            </button>
            <div className="mt-3 text-xs text-muted-foreground">
              Tap the circle to show the question.
            </div>
          </div>
        ) : (
          <>
            {/* Stem */}
            <div
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: q.stem }}
            />

            {/* Optional image */}
            {q.media?.type === "image" && (
              <img
                src={q.media.url}
                alt={q.media.alt ?? "Question image"}
                className="mt-2 max-h-[260px] w-auto rounded border"
              />
            )}

            {/* Choices */}
            <div className="mt-2 grid gap-2">
              {q.choices?.map((c) => {
                const selected = value === c.key;
                const isCorrectChoice =
                  q.answer != null &&
                  normalizeAns(c.key) === normalizeAns(q.answer);

                // Default styles
                let cls =
                  "justify-start border transition focus-visible:ring-2 focus-visible:ring-offset-2 bg-background hover:bg-accent text-foreground border-input";

                // BEFORE submission: highlight selected choice in indigo
                if (!submitted && selected) {
                  cls =
                    "justify-start border bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border-indigo-300 ring-1 ring-indigo-200";
                }

                // AFTER submission: green/red/soft-correct
                if (submitted) {
                  if (selected && isCorrect) {
                    cls =
                      "justify-start border bg-green-50 hover:bg-green-100 text-green-900 border-green-300";
                  } else if (selected && !isCorrect) {
                    cls =
                      "justify-start border bg-red-50 hover:bg-red-100 text-red-900 border-red-300";
                  } else if (!selected && isCorrectChoice) {
                    cls =
                      "justify-start border bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300";
                  } else {
                    cls =
                      "justify-start border bg-background text-foreground border-input opacity-70";
                  }
                }

                return (
                  <button
                    key={c.key}
                    type="button"
                    className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm ${cls}`}
                    onClick={() => {
                      if (!submitted) setValue(c.key);
                    }}
                    disabled={submitted}
                  >
                    <span className="mr-1 inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs">
                      {c.key}
                    </span>
                    <span>{c.text}</span>
                  </button>
                );
              })}
            </div>

            {/* Submit / Feedback */}
            {!submitted ? (
              <div className="pt-2">
                <Button onClick={submit} disabled={!answered}>
                  Check answer
                </Button>
              </div>
            ) : (
              <div
                className={`rounded-lg border p-3 ${
                  isCorrect
                    ? "bg-green-50 border-green-300 text-green-900"
                    : "bg-red-50 border-red-300 text-red-900"
                }`}
              >
                {isCorrect ? (
                  <div className="text-sm">
                    🎉 <span className="font-semibold">Great job!</span> You
                    chose the right answer.
                  </div>
                ) : (
                  <div className="text-sm">
                    🤔 <span className="font-semibold">Nice try.</span> Better
                    luck next time!
                  </div>
                )}
                <div className="mt-2 text-xs">
                  Correct answer:{" "}
                  <span className="font-semibold">{q.answer ?? "—"}</span>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>

      {/* FOOTER — no “new random” button here anymore */}
      <CardFooter className="text-xs text-muted-foreground">
        {submitted
          ? "You can pick another mode at the top, or try a random question again."
          : "Choose an answer and check to see feedback."}
      </CardFooter>
    </Card>
  );
}
