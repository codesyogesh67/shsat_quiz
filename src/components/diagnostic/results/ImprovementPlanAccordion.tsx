"use client";

import Link from "next/link";
import { ArrowRight, CalendarRange } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

export default function ImprovementPlanAccordion({
  report,
}: {
  report: Report;
}) {
  const todayTopic = report.weakTopics?.[0] ?? "your priority topic";
  const weekTopics =
    report.weakTopics?.slice(0, 2).join(" + ") || "your weakest topics";

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

      <Accordion type="single" collapsible className="mt-6 space-y-3">
        <AccordionItem value="today" className="rounded-2xl bg-slate-50 px-4">
          <AccordionTrigger className="text-left text-slate-900">
            Today
          </AccordionTrigger>
          <AccordionContent className="text-sm leading-6 text-slate-600">
            Practice {todayTopic} for {report.recommendedDailyMinutes} minutes
            and review mistakes carefully.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="week" className="rounded-2xl bg-slate-50 px-4">
          <AccordionTrigger className="text-left text-slate-900">
            This Week
          </AccordionTrigger>
          <AccordionContent className="text-sm leading-6 text-slate-600">
            Focus on {weekTopics}. Build accuracy before speed and review every
            wrong answer.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="month" className="rounded-2xl bg-slate-50 px-4">
          <AccordionTrigger className="text-left text-slate-900">
            This Month
          </AccordionTrigger>
          <AccordionContent className="text-sm leading-6 text-slate-600">
            Strengthen your weakest topics and maintain your strongest area with
            short review sessions.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="three-months"
          className="rounded-2xl bg-slate-50 px-4"
        >
          <AccordionTrigger className="text-left text-slate-900">
            3-Month Goal
          </AccordionTrigger>
          <AccordionContent className="text-sm leading-6 text-slate-600">
            Reach more balanced readiness with fewer weak spots and better timed
            performance.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}
