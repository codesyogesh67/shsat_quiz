"use client";

import React from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

function formatDateTime(d?: string | null) {
  if (!d) return "unknown time";
  const dt = new Date(d);
  return dt.toLocaleString(); // customize if you want
}

export function ContinueActiveExams() {
  const [state, setState] = React.useState<
    | { kind: "loading" }
    | { kind: "none" }
    | {
        kind: "some";
        sessions: Array<{
          sessionId: string;
          minutes?: number | null;
          startedAt?: string | null;
          questionCount?: number | null;
          answeredCount?: number | null;
        }>;
      }
  >({ kind: "loading" });

  const [open, setOpen] = React.useState(false);
  const [cancelingId, setCancelingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch("/api/exams/active", { cache: "no-store" });
        if (!alive) return;

        if (r.status === 204) {
          setState({ kind: "none" });
          return;
        }
        if (!r.ok) {
          setState({ kind: "none" });
          return;
        }

        const json = await r.json();
        const arr = Array.isArray(json) ? json : [json];
        if (!arr.length) {
          setState({ kind: "none" });
          return;
        }

        const sessions = arr.map((s: any) => ({
          sessionId: s.sessionId,
          minutes: s.minutes,
          startedAt: s.startedAt,
          questionCount: Array.isArray(s.questionIds)
            ? s.questionIds.length
            : null,
          answeredCount: s.responses ? Object.keys(s.responses).length : null,
        }));

        setState({ kind: "some", sessions });
      } catch {
        setState({ kind: "none" });
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  async function handleCancel(sessionId: string) {
    setCancelingId(sessionId);
    try {
      const res = await fetch(`/api/exams/${sessionId}/cancel`, {
        method: "DELETE",
      });
      if (res.ok) {
        setState((prev) => {
          if (prev.kind !== "some") return prev;
          const next = prev.sessions.filter((s) => s.sessionId !== sessionId);
          return next.length
            ? { kind: "some", sessions: next }
            : { kind: "none" };
        });
      }
    } finally {
      setCancelingId(null);
    }
  }

  if (state.kind !== "some") return null;

  const count = state.sessions.length;

  return (
    <Card className="border-primary/30">
      <CardHeader className="pb-2 flex flex-row items-center justify-between gap-2">
        <div>
          <CardTitle className="text-base">Continue your active exam</CardTitle>
          <CardDescription>
            You have {count} active {count === 1 ? "exam" : "exams"} in
            progress.
          </CardDescription>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setOpen((p) => !p)}
          className={
            open ? "rotate-180 transition-transform" : "transition-transform"
          }
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </CardHeader>

      {open && (
        <CardContent className="pt-0 space-y-3">
          {state.sessions.map((s) => (
            <div
              key={s.sessionId}
              className="flex flex-col gap-2 rounded-md border bg-muted/40 px-3 py-2 md:flex-row md:items-center md:justify-between"
            >
              <div className="text-sm">
                <p className="font-medium">In-progress exam</p>
                <p className="text-xs text-muted-foreground">
                  {s.answeredCount ?? 0}/{s.questionCount ?? "—"} answered ·{" "}
                  {s.minutes ?? "—"} min session
                </p>
                <p className="text-xs text-muted-foreground">
                  Started: {formatDateTime(s.startedAt)}
                </p>
              </div>
              <div className="flex gap-2">
                <Button asChild size="sm">
                  <Link href={`/exam/${s.sessionId}`}>Resume</Link>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCancel(s.sessionId)}
                  disabled={cancelingId === s.sessionId}
                >
                  {cancelingId === s.sessionId ? "Canceling..." : "Cancel"}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  );
}
