import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpenCheck,
  Clock3,
  ShieldCheck,
  Target,
} from "lucide-react";

import { getDiagnosticReport } from "@/lib/diagnostic-report";
import DiagnosticStudyPlanClient from "@/components/reports/DiagnosticStudyPlanClient";

type PageProps = {
  params: Promise<{
    sessionId: string;
  }>;
};

function getReadinessMessage(readinessLevel: string) {
  switch (readinessLevel) {
    case "Strong":
      return "You have a strong base. The next step is protecting accuracy while improving speed and consistency.";
    case "Competitive":
      return "You are close to stronger readiness. The next step is improving weak areas without losing your current strengths.";
    case "Developing":
      return "You need a steady foundation-first plan. The next step is building accuracy, confidence, and better solving habits.";
    default:
      return "This roadmap turns your diagnostic result into a clear study direction.";
  }
}

export default async function DiagnosticPlanPage({ params }: PageProps) {
  const { sessionId } = await params;
  if (!sessionId) notFound();

  const report = await getDiagnosticReport(sessionId);
  if (!report) notFound();

  const priorityTopic = report.weakTopics?.[0] ?? "your weakest topic";

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40">
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="space-y-6">
          <section className="relative overflow-hidden rounded-[30px] border border-slate-200/70 bg-white shadow-[0_24px_90px_-50px_rgba(79,70,229,0.45)]">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-fuchsia-200/30 blur-3xl" />

            <div className="relative p-5 sm:p-6 lg:p-8">
              <Link
                href={`/diagnostic/${report.sessionId}/results`}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/80 px-3 py-1.5 text-sm font-medium text-slate-600 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-50 hover:text-slate-950"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to diagnostic report
              </Link>

              <div className="mt-8 grid gap-7 lg:grid-cols-[1fr_360px] lg:items-end">
                <div className="flex gap-4">
                  <div className="hidden h-14 w-14 shrink-0 app-icon-filled sm:flex">
                    <BookOpenCheck className="h-7 w-7" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100">
                        Diagnostic Roadmap
                      </span>

                      <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200/70">
                        {report.readinessLevel} readiness
                      </span>
                    </div>

                    <h1 className="mt-4 max-w-4xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                      Your next 30 days of improvement
                    </h1>

                    <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                      {getReadinessMessage(report.readinessLevel)}
                    </p>
                  </div>
                </div>

                <div className="rounded-[26px] border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-5 shadow-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-indigo-700 shadow-sm">
                        <Clock3 className="h-5 w-5" />
                      </div>

                      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Daily pace
                      </p>

                      <p className="mt-1 text-2xl font-semibold text-slate-950">
                        {report.recommendedDailyMinutes}
                        <span className="ml-1 text-sm font-medium text-slate-500">
                          min
                        </span>
                      </p>
                    </div>

                    <div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-violet-700 shadow-sm">
                        <Target className="h-5 w-5" />
                      </div>

                      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        First focus
                      </p>

                      <p className="mt-1 line-clamp-2 text-sm font-semibold leading-6 text-slate-950">
                        {priorityTopic}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-white/80 bg-white/75 p-4">
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                      <p className="text-sm leading-6 text-slate-600">
                        This plan is stable by design. Students should complete
                        focused work before changing direction.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <DiagnosticStudyPlanClient
            topicStats={report.topicStats}
            recommendedDailyMinutes={report.recommendedDailyMinutes}
          />
        </div>
      </div>
    </main>
  );
}
