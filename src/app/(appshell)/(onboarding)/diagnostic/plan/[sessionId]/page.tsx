import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Sparkles,
  Target,
  TrendingUp,
  BookOpenCheck,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

import { getDiagnosticReport } from "@/lib/diagnostic-report";
import DiagnosticStudyPlanClient from "@/components/reports/DiagnosticStudyPlanClient";

type PageProps = {
  params: Promise<{
    sessionId: string;
  }>;
};

function monthGoal(readinessLevel: string) {
  switch (readinessLevel) {
    case "Strong":
      return "Sharpen timing and maintain topic balance.";
    case "Competitive":
      return "Raise weak-topic performance while improving mixed practice confidence.";
    case "Developing":
      return "Strengthen foundations and create more consistent solving habits.";
    default:
      return "Focus on fundamentals first and build steady confidence.";
  }
}

function ninetyDayGoal(readinessLevel: string) {
  switch (readinessLevel) {
    case "Strong":
      return "Aim for strong accuracy under full SHSAT timing.";
    case "Competitive":
      return "Build balanced readiness with fewer weak areas.";
    case "Developing":
      return "Move from uneven performance to more stable topic coverage.";
    default:
      return "Create a stronger base across all major categories.";
  }
}

const planCards = [
  {
    label: "Today",
    icon: Target,
    tone: "from-indigo-50 via-white to-indigo-50",
    iconTone: "bg-indigo-600 text-white",
  },
  {
    label: "This Week",
    icon: CalendarDays,
    tone: "from-violet-50 via-white to-violet-50",
    iconTone: "bg-violet-600 text-white",
  },
  {
    label: "This Month",
    icon: TrendingUp,
    tone: "from-fuchsia-50 via-white to-fuchsia-50",
    iconTone: "bg-fuchsia-600 text-white",
  },
  {
    label: "3-Month Goal",
    icon: Sparkles,
    tone: "from-slate-50 via-white to-indigo-50",
    iconTone: "bg-slate-900 text-white",
  },
];

export default async function DiagnosticPlanPage({ params }: PageProps) {
  const { sessionId } = await params;
  if (!sessionId) notFound();

  const report = await getDiagnosticReport(sessionId);
  if (!report) notFound();

  const todayTopic = report.weakTopics?.[0] ?? "your priority topic";
  const weekTopics =
    report.weakTopics?.slice(0, 2).join(" + ") || "your weakest topics";
  const monthTopics =
    report.weakTopics?.slice(0, 3).join(", ") || "your main focus topics";

  const cards = [
    {
      ...planCards[0],
      title: `Start with ${todayTopic}`,
      description: `Study ${todayTopic} for ${report.recommendedDailyMinutes} minutes and review each mistake before moving on.`,
    },
    {
      ...planCards[1],
      title: `Focus on ${weekTopics}`,
      description:
        "Work on accuracy first. Slow down, show steps clearly, and review wrong answers before doing more sets.",
    },
    {
      ...planCards[2],
      title: `Strengthen ${monthTopics}`,
      description: `${monthGoal(
        report.readinessLevel
      )} Keep your strongest topic active with short review practice.`,
    },
    {
      ...planCards[3],
      title: "Reach more balanced readiness",
      description: ninetyDayGoal(report.readinessLevel),
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40">
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="space-y-6">
          <section className="relative overflow-hidden rounded-[28px] border border-slate-200/70 bg-white p-5 shadow-sm sm:p-6 lg:p-8">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-fuchsia-200/30 blur-3xl" />

            <div className="relative">
              <Link
                href={`/diagnostic/${report.sessionId}/results`}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/80 px-3 py-1.5 text-sm font-medium text-slate-600 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-50 hover:text-slate-950"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to diagnostic report
              </Link>

              <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end">
                <div className="flex gap-4">
                  <div className="hidden h-14 w-14 app-icon-filled sm:flex">
                    <BookOpenCheck className="h-7 w-7" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100">
                        Full Study Plan
                      </span>
                      <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200/70">
                        {report.readinessLevel} readiness
                      </span>
                    </div>

                    <h1 className="mt-4 max-w-4xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                      Your improvement roadmap
                    </h1>

                    <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                      A focused plan built from your diagnostic results. Use it
                      to improve weak areas, protect strengths, and know exactly
                      what to do next.
                    </p>
                  </div>
                </div>

                <div className="rounded-[24px] border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700">
                        Recommended pace
                      </p>
                      <p className="mt-2 text-3xl font-semibold text-slate-950">
                        {report.recommendedDailyMinutes}
                        <span className="ml-1 text-base font-medium text-slate-500">
                          min/day
                        </span>
                      </p>
                    </div>

                    <div className="flex h-12 w-12 app-icon-filled">
                      <Clock3 className="h-6 w-6" />
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl bg-white/80 p-4 ring-1 ring-indigo-100/80">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5" />

                      <p className="text-sm leading-6 text-slate-700">
                        Start with{" "}
                        <span className="font-semibold text-slate-950">
                          {todayTopic}
                        </span>{" "}
                        before moving into mixed practice.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.label}
                  className={`group relative overflow-hidden rounded-[24px] border border-slate-200/70 bg-gradient-to-br ${card.tone} p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_-30px_rgba(79,70,229,0.45)]`}
                >
                  <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-white/70 blur-2xl" />

                  <div className="relative">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-11 w-11 app-icon-filled">
                        <Icon className="h-5 w-5" />
                      </div>

                      <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200/70">
                        {card.label}
                      </span>
                    </div>

                    <h2 className="mt-5 text-lg font-semibold leading-snug text-slate-950">
                      {card.title}
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {card.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </section>

          <section className="">
            <div className="min-w-0 rounded-[28px] border border-slate-200/70 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
              <DiagnosticStudyPlanClient
                topicStats={report.topicStats}
                sessionId={sessionId}
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
