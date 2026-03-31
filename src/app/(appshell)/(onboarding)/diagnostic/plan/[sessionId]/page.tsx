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
} from "lucide-react";
import { getDiagnosticReport } from "@/lib/diagnostic-report";

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

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm md:p-8">
            <Link
              href={`/diagnostic/results/${report.sessionId}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-all duration-200 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to diagnostic report
            </Link>

            <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Full Study Plan
                </p>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
                  Your improvement roadmap
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
                  A longer-term plan built from your diagnostic results. Follow
                  this roadmap to improve weak topics, maintain strengths, and
                  build stronger SHSAT readiness over time.
                </p>
              </div>

              <div className="rounded-2xl bg-indigo-50 px-4 py-3 text-sm text-slate-700">
                Recommended study time:{" "}
                <span className="font-semibold text-slate-900">
                  {report.recommendedDailyMinutes} min/day
                </span>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <Target className="h-5 w-5" />
              </div>
              <p className="mt-4 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                Today
              </p>
              <h2 className="mt-2 text-lg font-semibold text-slate-900">
                Start with {todayTopic}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Study {todayTopic} for {report.recommendedDailyMinutes} minutes
                and review each mistake before moving on.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <CalendarDays className="h-5 w-5" />
              </div>
              <p className="mt-4 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                This Week
              </p>
              <h2 className="mt-2 text-lg font-semibold text-slate-900">
                Focus on {weekTopics}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Work on accuracy first. Slow down, show steps clearly, and
                review wrong answers before doing more sets.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <TrendingUp className="h-5 w-5" />
              </div>
              <p className="mt-4 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                This Month
              </p>
              <h2 className="mt-2 text-lg font-semibold text-slate-900">
                Strengthen {monthTopics}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {monthGoal(report.readinessLevel)} Keep your strongest topic
                active with short review practice.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <Sparkles className="h-5 w-5" />
              </div>
              <p className="mt-4 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                3-Month Goal
              </p>
              <h2 className="mt-2 text-lg font-semibold text-slate-900">
                Reach more balanced readiness
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {ninetyDayGoal(report.readinessLevel)}
              </p>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm md:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <Clock3 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    30-Day Focus
                  </p>
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                    How to spend the next month
                  </h2>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Week 1
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    Focus on your weakest topic first and build cleaner problem
                    solving habits.
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Week 2
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    Add a second weak topic and begin mixing short review with
                    targeted drills.
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Week 3
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    Practice mixed sets and start watching for repeated mistake
                    patterns.
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Week 4
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    Add timed practice and compare new results against your
                    diagnostic weak areas.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm md:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Checkpoints
                  </p>
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                    What progress should look like
                  </h2>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                  You should feel more confident in{" "}
                  <span className="font-semibold text-slate-900">
                    {todayTopic}
                  </span>{" "}
                  after the first week of focused review.
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                  By the end of the month, your weak-topic work should feel more
                  structured and less random.
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                  Over 3 months, the goal is fewer obvious gaps and stronger
                  overall balance across categories.
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
