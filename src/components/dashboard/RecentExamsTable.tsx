import React from "react";
import Link from "next/link";
import { ArrowRight, RotateCcw, SearchCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ExamResult } from "./types";
import { fmtLocalDate, minutesToHMM, pct } from "./utils";

function scoreTone(scoreRaw: number) {
  if (scoreRaw >= 45) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (scoreRaw >= 30) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }
  return "border-rose-200 bg-rose-50 text-rose-700";
}

function modeLabel(mode: string) {
  const normalized = mode.toLowerCase();

  if (normalized === "test") return "Full Exam";
  if (normalized === "topic") return "Topic Practice";
  if (normalized === "diagnostic") return "Diagnostic";
  return mode;
}

export function RecentExamsTable({ exams }: { exams: ExamResult[] }) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200/70 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
      <div className="border-b border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.92))] px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              Recent exams
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Review completed sessions and repeat important practice.
            </p>
          </div>

          <Button
            asChild
            size="sm"
            className="w-fit rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-500/20 hover:opacity-95"
          >
            <Link href="/practice">
              Start another exam
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {exams.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200/80 bg-slate-50 text-slate-500 shadow-sm">
            <SearchCheck className="h-6 w-6" />
          </div>

          <h3 className="mt-4 text-lg font-semibold tracking-tight text-slate-900">
            No completed exams yet
          </h3>

          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
            Once you finish a session, your exam history will appear here for
            review, retakes, and progress tracking.
          </p>

          <Button
            asChild
            className="mt-5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-500/20 hover:opacity-95"
          >
            <Link href="/practice">Take your first exam</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50/80">
                  <tr className="border-b border-slate-200/70 text-left">
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Date
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Session
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Score
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Accuracy
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Time
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Flags
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {exams.map((e) => (
                    <tr
                      key={e.id}
                      className="border-b border-slate-100 transition-colors duration-150 hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 text-slate-700">
                        {fmtLocalDate(e.dateISO)}
                      </td>

                      <td className="px-6 py-4">
                        <div className="min-w-0 flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="border-slate-200/80 bg-white text-[11px] text-slate-600"
                          >
                            {e.mode}
                          </Badge>

                          <p className="text-sm text-slate-500">
                            {e.label ?? "Completed session"}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <Badge className={scoreTone(e.scoreRaw)}>
                          {e.scoreRaw}/57
                        </Badge>
                      </td>

                      <td className="px-6 py-4 font-medium text-slate-900">
                        {pct(e.accuracy)}%
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {minutesToHMM(e.minutesSpent)}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {e.flaggedCount}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="rounded-xl border-slate-200/80 bg-white text-slate-700 hover:bg-slate-50"
                          >
                            <Link
                              href={`/practice?reviewSession=${
                                e.id
                              }&filter=all&from=${encodeURIComponent(
                                "/dashboard"
                              )}`}
                            >
                              Review
                            </Link>
                          </Button>

                          <Button
                            asChild
                            // size="icon"
                            className="app-icon-square"
                          >
                            <Link
                              href={`/exams?retake=${e.id}`}
                              aria-label={`Retake ${
                                e.label ?? modeLabel(e.mode)
                              }`}
                              title="Retake"
                            >
                              <RotateCcw />
                            </Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid gap-4 p-5 md:hidden">
            {exams.map((e) => (
              <div
                key={e.id}
                className="rounded-2xl border border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.88))] p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-sm font-semibold tracking-tight text-slate-900">
                        {modeLabel(e.mode)}
                      </div>

                      <Badge
                        variant="outline"
                        className="border-slate-200/80 bg-white text-[11px] text-slate-600"
                      >
                        {e.mode}
                      </Badge>
                    </div>

                    <div className="mt-1 text-sm text-slate-500">
                      {e.label ?? "Completed session"} •{" "}
                      {fmtLocalDate(e.dateISO)}
                    </div>
                  </div>

                  <Badge className={scoreTone(e.scoreRaw)}>
                    {e.scoreRaw}/57
                  </Badge>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm">
                    <div className="text-xs font-medium text-slate-500">
                      Accuracy
                    </div>
                    <div className="mt-1 text-base font-semibold text-slate-900">
                      {pct(e.accuracy)}%
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm">
                    <div className="text-xs font-medium text-slate-500">
                      Time
                    </div>
                    <div className="mt-1 text-base font-semibold text-slate-900">
                      {minutesToHMM(e.minutesSpent)}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm">
                    <div className="text-xs font-medium text-slate-500">
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
                    className="flex-1 rounded-xl border-slate-200/80 bg-white text-slate-700 hover:bg-slate-50"
                  >
                    <Link
                      href={`/practice?reviewSession=${
                        e.id
                      }&filter=all&from=${encodeURIComponent("/dashboard")}`}
                    >
                      Review
                    </Link>
                  </Button>

                  <Button
                    asChild
                    // size="icon"
                    className="app-icon-square"
                  >
                    <Link
                      href={`/exams?retake=${e.id}`}
                      aria-label={`Retake ${e.label ?? modeLabel(e.mode)}`}
                      title="Retake"
                    >
                      <RotateCcw />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
