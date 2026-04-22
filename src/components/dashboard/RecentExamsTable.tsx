import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  RotateCcw,
  SearchCheck,
  Sparkles,
  Clock3,
  Flag,
  Target,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import RetakeSessionButton from "@/components/dashboard/RetakeSessionButton";
import type { ExamResult } from "./types";
import { fmtLocalDate, minutesToHMM, pct } from "./utils";

function scoreTone(scoreRaw: number) {
  if (scoreRaw >= 45) {
    return "border-emerald-200/80 bg-emerald-50 text-emerald-700";
  }
  if (scoreRaw >= 30) {
    return "border-amber-200/80 bg-amber-50 text-amber-700";
  }
  return "border-rose-200/80 bg-rose-50 text-rose-700";
}

function accuracyTone(value: number) {
  if (value >= 80) {
    return {
      bar: "from-emerald-500 to-teal-500",
      text: "text-emerald-700",
      ring: "ring-emerald-100",
      soft: "from-emerald-50 via-white to-teal-50",
    };
  }

  if (value >= 60) {
    return {
      bar: "from-amber-500 to-orange-500",
      text: "text-amber-700",
      ring: "ring-amber-100",
      soft: "from-amber-50 via-white to-orange-50",
    };
  }

  return {
    bar: "from-rose-500 to-pink-500",
    text: "text-rose-700",
    ring: "ring-rose-100",
    soft: "from-rose-50 via-white to-pink-50",
  };
}

function modeLabel(mode: string) {
  const normalized = mode.toLowerCase();

  if (normalized === "test") return "Full Exam";
  if (normalized === "topic") return "Topic Practice";
  if (normalized === "diagnostic") return "Diagnostic";
  return mode;
}

function modeTone(mode: string) {
  const normalized = mode.toLowerCase();

  if (normalized === "diagnostic") {
    return "border-violet-200/80 bg-violet-50 text-violet-700";
  }

  if (normalized === "topic") {
    return "border-sky-200/80 bg-sky-50 text-sky-700";
  }

  if (normalized === "test") {
    return "border-indigo-200/80 bg-indigo-50 text-indigo-700";
  }

  return "border-slate-200/80 bg-slate-50 text-slate-700";
}

function reviewHref(sessionId: string) {
  return `/practice?reviewSession=${sessionId}&filter=all&from=${encodeURIComponent(
    "/dashboard"
  )}`;
}

export function RecentExamsTable({ exams }: { exams: ExamResult[] }) {
  return (
    <section className="w-full overflow-hidden rounded-[28px] border border-slate-200/70 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
      <div className="relative overflow-hidden border-b border-slate-200/70 px-5 py-5 sm:px-6">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/70 to-indigo-50/60" />
        <div className="absolute -left-16 top-0 h-40 w-40 rounded-full bg-indigo-200/20 blur-3xl" />
        <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-violet-200/20 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-200/60 to-transparent" />

        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-500 to-fuchsia-500 text-white shadow-[0_12px_24px_rgba(99,102,241,0.25)]">
              <Sparkles className="h-5 w-5 text-white" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
                  Recent exam history
                </h2>

                <Badge className="rounded-full border border-indigo-200/70 bg-indigo-50 text-indigo-700">
                  {exams.length} {exams.length === 1 ? "session" : "sessions"}
                </Badge>
              </div>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                Review completed sessions, revisit mistakes, and quickly restart
                focused practice.
              </p>
            </div>
          </div>

          <Button
            asChild
            size="sm"
            className="w-fit rounded-xl bg-gradient-to-r from-indigo-600 via-violet-500 to-fuchsia-500 text-white shadow-[0_10px_24px_rgba(99,102,241,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:opacity-95"
          >
            <Link href="/practice">
              Start another exam
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {exams.length === 0 ? (
        <div className="relative overflow-hidden px-6 py-16 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/70 to-indigo-50/40" />
          <div className="absolute left-1/2 top-10 h-24 w-24 -translate-x-1/2 rounded-full bg-indigo-100/50 blur-3xl" />

          <div className="relative flex flex-col items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-[22px] border border-slate-200/80 bg-white text-slate-500 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
              <SearchCheck className="h-7 w-7" />
            </div>

            <h3 className="mt-5 text-lg font-semibold tracking-tight text-slate-900">
              No completed exams yet
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              Once you finish a session, your recent exam history will appear
              here for review, retakes, and progress tracking.
            </p>

            <Button
              asChild
              className="mt-6 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-500 to-fuchsia-500 text-white shadow-[0_10px_24px_rgba(99,102,241,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:opacity-95"
            >
              <Link href="/practice">Take your first exam</Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-sm">
                <thead>
                  <tr className="border-b border-slate-200/70 bg-gradient-to-r from-slate-50/90 via-white to-indigo-50/40 text-left">
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Date
                    </th>
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Session
                    </th>
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Score
                    </th>
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Accuracy
                    </th>
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Time
                    </th>

                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {exams.map((e) => {
                    const accuracyValue = pct(e.accuracy);
                    const accuracyUi = accuracyTone(accuracyValue);

                    return (
                      <tr
                        key={e.id}
                        className="group border-b border-slate-100/90 transition-all duration-300 hover:bg-gradient-to-r hover:from-slate-50/70 hover:via-white hover:to-indigo-50/30"
                      >
                        <td className="px-6 py-4 align-middle">
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-800">
                              {fmtLocalDate(e.dateISO)}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4 align-middle">
                          <div className="min-w-0">
                            <p className="mt-2 max-w-[260px] truncate text-sm text-slate-600">
                              {e.label ?? "Completed session"}
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-4 align-middle">
                          <Badge
                            className={`rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${scoreTone(
                              e.scoreRaw
                            )}`}
                          >
                            {e.scoreRaw}/57
                          </Badge>
                        </td>

                        <td className="px-6 py-4 align-middle">
                          <div className="min-w-[160px]">
                            <div className="flex items-center justify-between gap-3">
                              <span
                                className={`text-sm font-semibold ${accuracyUi.text}`}
                              >
                                {accuracyValue}%
                              </span>
                            </div>

                            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className={`h-full rounded-full bg-gradient-to-r ${accuracyUi.bar}`}
                                style={{
                                  width: `${Math.max(
                                    0,
                                    Math.min(100, accuracyValue)
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 align-middle">
                          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white px-3 py-1.5 text-sm text-slate-600 shadow-sm">
                            <Clock3 className="h-3.5 w-3.5 text-slate-400" />
                            {minutesToHMM(e.minutesSpent)}
                          </div>
                        </td>

                        <td className="px-6 py-4 align-middle">
                          <div className="flex items-center gap-2">
                            <Button
                              asChild
                              size="sm"
                              variant="outline"
                              className="rounded-xl border-slate-200/80 bg-white text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-50"
                            >
                              <Link href={reviewHref(e.id)}>Review</Link>
                            </Button>
                            <RetakeSessionButton sessionId={e.id} iconOnly />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid gap-4 p-5 md:hidden">
            {exams.map((e) => {
              const accuracyValue = pct(e.accuracy);
              const accuracyUi = accuracyTone(accuracyValue);

              return (
                <div
                  key={e.id}
                  className="group relative overflow-hidden rounded-[24px] border border-slate-200/70 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_35px_rgba(15,23,42,0.08)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/70 to-indigo-50/40" />
                  <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-indigo-100/40 blur-2xl" />

                  <div className="relative">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${modeTone(
                              e.mode
                            )}`}
                          >
                            {modeLabel(e.mode)}
                          </Badge>

                          <Badge
                            variant="outline"
                            className="rounded-full border-slate-200/80 bg-white text-[11px] text-slate-500"
                          >
                            {e.mode}
                          </Badge>
                        </div>

                        <div className="mt-3 text-sm font-semibold tracking-tight text-slate-900">
                          {e.label ?? "Completed session"}
                        </div>

                        <div className="mt-1 text-sm text-slate-500">
                          {fmtLocalDate(e.dateISO)}
                        </div>
                      </div>

                      <Badge
                        className={`rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${scoreTone(
                          e.scoreRaw
                        )}`}
                      >
                        {e.scoreRaw}/57
                      </Badge>
                    </div>

                    <div
                      className={`mt-4 rounded-[20px] border border-white/70 bg-gradient-to-br p-4 ring-1 ${accuracyUi.ring} ${accuracyUi.soft}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                            Accuracy
                          </div>
                          <div
                            className={`mt-1 text-2xl font-semibold ${accuracyUi.text}`}
                          >
                            {accuracyValue}%
                          </div>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 shadow-sm">
                          <Target className="h-5 w-5 text-slate-600" />
                        </div>
                      </div>

                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/80">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${accuracyUi.bar}`}
                          style={{
                            width: `${Math.max(
                              0,
                              Math.min(100, accuracyValue)
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-[18px] border border-slate-200/80 bg-white p-3 shadow-sm">
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                          <Clock3 className="h-3.5 w-3.5" />
                          Time
                        </div>
                        <div className="mt-1 text-base font-semibold text-slate-900">
                          {minutesToHMM(e.minutesSpent)}
                        </div>
                      </div>

                      <div className="rounded-[18px] border border-slate-200/80 bg-white p-3 shadow-sm">
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                          <Flag className="h-3.5 w-3.5" />
                          Flags
                        </div>
                        <div className="mt-1 text-base font-semibold text-slate-900">
                          {e.flaggedCount}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="flex-1 rounded-xl border-slate-200/80 bg-white text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-50"
                      >
                        <Link href={reviewHref(e.id)}>Review</Link>
                      </Button>

                      <RetakeSessionButton sessionId={e.id} iconOnly />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
