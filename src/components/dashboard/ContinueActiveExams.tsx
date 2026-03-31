"use client";

import React from "react";
import Link from "next/link";
import { ChevronDown, Clock3, PlayCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type ActiveExamResponse = {
  sessionId: string;
  label?: string | null;
  minutes: number | null;
  startedAt: string | null;
  questionIds: string[];
  responses: Record<
    string,
    {
      questionId: string;
      answer: string | null;
      flagged: boolean;
      timeSpentSec: number;
    }
  >;
};

type ActiveSessionCard = {
  sessionId: string;
  label: string | null;
  minutes: number | null;
  startedAt: string | null;
  questionCount: number | null;
  answeredCount: number | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isActiveExamResponse(value: unknown): value is ActiveExamResponse {
  if (!isRecord(value)) return false;

  const sessionIdOk = typeof value.sessionId === "string";
  const minutesOk = value.minutes === null || typeof value.minutes === "number";
  const startedAtOk =
    value.startedAt === null || typeof value.startedAt === "string";
  const questionIdsOk =
    Array.isArray(value.questionIds) &&
    value.questionIds.every((item) => typeof item === "string");
  const responsesOk =
    value.responses === undefined ||
    value.responses === null ||
    isRecord(value.responses);

  return (
    sessionIdOk && minutesOk && startedAtOk && questionIdsOk && responsesOk
  );
}

function formatDateTimeNY(d?: string | null) {
  if (!d) return "unknown time";

  const parsed = new Date(d);
  if (Number.isNaN(parsed.getTime())) return "unknown time";

  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(parsed);
}

export function ContinueActiveExams() {
  const [state, setState] = React.useState<
    | { kind: "loading" }
    | { kind: "none" }
    | { kind: "some"; sessions: ActiveSessionCard[] }
  >({ kind: "loading" });

  const [open, setOpen] = React.useState(true);
  const [cancelingId, setCancelingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const r = await fetch("/api/sessions/active", { cache: "no-store" });

        if (!alive) return;

        if (r.status === 204 || !r.ok) {
          setState({ kind: "none" });
          return;
        }

        const json: unknown = await r.json();
        const raw = Array.isArray(json) ? json : [json];
        const valid = raw.filter(isActiveExamResponse);

        if (!valid.length) {
          setState({ kind: "none" });
          return;
        }

        const sessions: ActiveSessionCard[] = valid.map((s) => ({
          sessionId: s.sessionId,
          label: s.label ?? null,
          minutes: s.minutes ?? null,
          startedAt: s.startedAt ?? null,
          questionCount: Array.isArray(s.questionIds)
            ? s.questionIds.length
            : null,
          answeredCount:
            s.responses && isRecord(s.responses)
              ? Object.keys(s.responses).length
              : 0,
        }));

        setState(
          sessions.length ? { kind: "some", sessions } : { kind: "none" }
        );
      } catch {
        if (alive) {
          setState({ kind: "none" });
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  async function handleCancel(sessionId: string) {
    setCancelingId(sessionId);

    try {
      const res = await fetch(`/api/sessions/${sessionId}/cancel`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        console.error("Failed to cancel session", body);
        return;
      }

      setState((prev) => {
        if (prev.kind !== "some") return prev;

        const next = prev.sessions.filter((s) => s.sessionId !== sessionId);

        return next.length
          ? { kind: "some", sessions: next }
          : { kind: "none" };
      });
    } finally {
      setCancelingId(null);
    }
  }

  if (state.kind === "loading") {
    return (
      <section className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm">
        <div className="animate-pulse">
          <div className="h-4 w-36 rounded bg-slate-200" />
          <div className="mt-3 h-3 w-60 rounded bg-slate-100" />
        </div>
      </section>
    );
  }

  if (state.kind !== "some") return null;

  const count = state.sessions.length;

  return (
    <section className="overflow-hidden rounded-3xl border border-amber-200/70 bg-white shadow-sm">
      <div className="bg-gradient-to-r from-amber-50 via-white to-orange-50 px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-200/70 bg-white text-amber-600">
              <Clock3 className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Continue your active exam
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                You have {count} active {count === 1 ? "exam" : "exams"} still
                in progress.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen((p) => !p)}
            className="w-fit rounded-xl border-slate-200 bg-white"
          >
            {open ? "Hide exams" : "Show exams"}
            <ChevronDown
              className={[
                "ml-2 h-4 w-4 transition-transform",
                open ? "rotate-180" : "",
              ].join(" ")}
            />
          </Button>
        </div>
      </div>

      {open ? (
        <div className="grid gap-4 p-5 sm:p-6">
          {state.sessions.map((s) => (
            <div
              key={s.sessionId}
              className="rounded-2xl border border-slate-200/70 bg-slate-50/60 p-4"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {s.label ?? "In-progress exam"}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                    <span>
                      {s.answeredCount ?? 0}/{s.questionCount ?? "—"} answered
                    </span>
                    <span>•</span>
                    <span>{s.minutes ?? "—"} min session</span>
                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    Started: {formatDateTimeNY(s.startedAt)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    asChild
                    size="sm"
                    className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:opacity-95"
                  >
                    <Link href={`/session/${s.sessionId}`}>
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Continue
                    </Link>
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={cancelingId === s.sessionId}
                    onClick={() => handleCancel(s.sessionId)}
                    className="rounded-xl border-slate-200 bg-white"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    {cancelingId === s.sessionId ? "Canceling..." : "Cancel"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
