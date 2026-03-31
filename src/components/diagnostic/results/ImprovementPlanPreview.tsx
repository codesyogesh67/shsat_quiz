"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CalendarRange, Target, TrendingUp } from "lucide-react";

type TopicStat = {
  topic: string;
  correct: number;
  total: number;
  accuracy: number;
  status: "Strong" | "Good" | "Needs Work" | "Priority";
};

type Report = {
  sessionId: string;
  readinessLevel: "Strong" | "Competitive" | "Developing" | "Needs Support";
  recommendedDailyMinutes: number | string;
  weakTopics: string[];
  strongestTopic: TopicStat | null;
  weakestTopic: TopicStat | null;
};

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.4,
      ease: "easeOut" as const,
    },
  }),
};

function getMonthlyGoal(readinessLevel: Report["readinessLevel"]) {
  switch (readinessLevel) {
    case "Strong":
      return "Refine timing, maintain strengths, and close small gaps.";
    case "Competitive":
      return "Raise weak-topic accuracy and improve mixed practice confidence.";
    case "Developing":
      return "Build topic-by-topic confidence and strengthen fundamentals.";
    default:
      return "Focus on foundations first, then gradually add timed practice.";
  }
}

function getThreeMonthGoal(readinessLevel: Report["readinessLevel"]) {
  switch (readinessLevel) {
    case "Strong":
      return "Move toward high consistency under timed SHSAT conditions.";
    case "Competitive":
      return "Reach stronger balance across topics with better pacing.";
    case "Developing":
      return "Build a steady score base and reduce weak-topic dependence.";
    default:
      return "Create a stable foundation and measurable growth across categories.";
  }
}

export default function ImprovementPlanPreview({ report }: { report: Report }) {
  const todayTopic = report.weakTopics?.[0] ?? "your priority topic";
  const weekTopics =
    report.weakTopics?.slice(0, 2).join(" + ") || "your weakest topics";
  const strongestTopic = report.strongestTopic?.topic ?? "your strongest area";
  const weakestTopic = report.weakestTopic?.topic ?? "your priority area";

  const cards = [
    {
      label: "Today",
      title: `Start with ${todayTopic}`,
      text: `Practice ${todayTopic} for ${report.recommendedDailyMinutes} minutes and review every mistake carefully.`,
      icon: Target,
    },
    {
      label: "This Week",
      title: "Build accuracy first",
      text: `Focus on ${weekTopics}. Go slower, aim for cleaner solving, and review wrong answers before doing more questions.`,
      icon: CalendarRange,
    },
    {
      label: "This Month",
      title: "Strengthen your weak areas",
      text: `${getMonthlyGoal(
        report.readinessLevel
      )} Keep ${strongestTopic} active with short review sessions.`,
      icon: TrendingUp,
    },
    {
      label: "3-Month Goal",
      title: "Work toward balanced readiness",
      text: `${getThreeMonthGoal(
        report.readinessLevel
      )} Your biggest growth area right now is ${weakestTopic}.`,
      icon: ArrowRight,
    },
  ];

  return (
    <section className="p-6 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <CalendarRange className="h-5 w-5" />
          </div>

          <div>
            <p className="text-sm font-medium text-slate-500">
              Improvement Plan
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
              Your next steps from this diagnostic
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
              A focused roadmap based on your weak topics, strongest area, and
              current readiness level.
            </p>
          </div>
        </div>

        <Link
          href={`/diagnostic/plan/${report.sessionId}`}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-all duration-200 hover:opacity-95"
        >
          View full plan
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-4">
        {cards.map((card, i) => {
          const Icon = card.icon;

          return (
            <motion.div
              key={card.label}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="rounded-[28px] bg-slate-50 p-5 transition-all duration-200 hover:bg-slate-100"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                    {card.label}
                  </p>
                  <h3 className="mt-3 text-base font-semibold leading-6 text-slate-900">
                    {card.title}
                  </h3>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm">
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                {card.text}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
