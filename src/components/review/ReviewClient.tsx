// components/review/ReviewClient.tsx
"use client";

import * as React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { ReviewRow } from "@/app/review/[sessionId]/page";

type ReviewTab = "all" | "wrong" | "correct" | "flagged";

function isReviewTab(v: string): v is ReviewTab {
  return v === "all" || v === "wrong" || v === "correct" || v === "flagged";
}

export default function ReviewClient({
  sessionMeta,
  rows,
}: {
  sessionMeta: { sessionId: string; title: string; summary: string };
  rows: ReviewRow[];
}) {
  const wrong = rows.filter((r) => r.correct === false);
  const right = rows.filter((r) => r.correct === true);
  const flagged = rows.filter((r) => r.flagged);

  // keyboard: n/p to move within current tab
  const [tab, setTab] = React.useState<"all" | "wrong" | "correct" | "flagged">(
    wrong.length ? "wrong" : "all"
  );
  const filtered =
    tab === "all"
      ? rows
      : tab === "wrong"
      ? wrong
      : tab === "correct"
      ? right
      : flagged;

  const [idx, setIdx] = React.useState(0);
  React.useEffect(() => {
    setIdx(0);
  }, [tab]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "n")
        setIdx((i) => Math.min(filtered.length - 1, i + 1));
      if (e.key.toLowerCase() === "p") setIdx((i) => Math.max(0, i - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filtered.length]);

  // scroll selected card into view when idx changes
  const activeRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [idx]);

  return (
    <div className="space-y-4">
      {/* header */}
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{sessionMeta.title}</h1>
          <p className="text-sm text-muted-foreground">{sessionMeta.summary}</p>
        </div>
        <div className="text-xs text-muted-foreground">
          Tip: use <kbd className="px-1 border rounded">N</kbd>/
          <kbd className="px-1 border rounded">P</kbd> to navigate
        </div>
      </div>

      {/* sticky tabs */}
      <div className="sticky top-16 z-10 bg-background/80 backdrop-blur">
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(isReviewTab(v) ? v : "all")}
        >
          <TabsList>
            <TabsTrigger value="all">
              All <Count n={rows.length} />
            </TabsTrigger>
            <TabsTrigger value="wrong">
              Wrong <Count n={wrong.length} />
            </TabsTrigger>
            <TabsTrigger value="correct">
              Correct <Count n={right.length} />
            </TabsTrigger>
            <TabsTrigger value="flagged">
              Flagged <Count n={flagged.length} />
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Separator />
      </div>

      {/* quick jump pills */}
      <div className="flex flex-wrap gap-2">
        {filtered.map((r, i) => (
          <button
            key={r.questionId}
            onClick={() => setIdx(i)}
            className={`px-2 py-1 text-xs rounded border ${
              i === idx ? "bg-primary text-primary-foreground" : ""
            }`}
            title={`Q${r.qnum}`}
          >
            Q{r.qnum}
          </button>
        ))}
      </div>

      {/* list */}
      <div className="space-y-3">
        {filtered.map((r, i) => {
          const isActive = i === idx;
          return (
            <Card
              key={r.questionId}
              ref={isActive ? activeRef : null}
              className={`p-4 border ${isActive ? "ring-2 ring-primary" : ""}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">
                    Q{r.qnum} {r.category ? `• ${r.category}` : ""}
                  </div>
                  <div className="text-base font-medium whitespace-pre-wrap">
                    {r.stem}
                  </div>
                  <div className="mt-2 text-sm">
                    <span className="mr-4">
                      Your: <b>{r.user ?? "—"}</b>
                    </span>
                    <span className="text-muted-foreground">
                      Correct: <b>{r.gold ?? "—"}</b>
                    </span>
                  </div>
                </div>
                <div className="shrink-0 space-x-2">
                  {r.correct ? (
                    <Badge className="bg-green-600 hover:bg-green-600">
                      Correct
                    </Badge>
                  ) : (
                    <Badge variant="destructive">Wrong</Badge>
                  )}
                  {r.flagged && <Badge variant="secondary">Flagged</Badge>}
                </div>
              </div>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-sm text-muted-foreground">Nothing here yet.</div>
        )}
      </div>
    </div>
  );
}

function Count({ n }: { n: number }) {
  return (
    <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded bg-muted px-1 text-[10px]">
      {n}
    </span>
  );
}
