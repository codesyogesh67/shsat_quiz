"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DashboardData } from "./types";
import { pct, minutesToHMM } from "./utils";

type Props = {
  data: DashboardData;
};

export function DashboardHero({ data }: Props) {
  const weakest = [...data.categoryStats]
    .filter((item) => item.attempted > 0)
    .sort((a, b) => a.accuracy - b.accuracy)[0];

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-sm"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-violet-50/80" />
      <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-violet-200/20 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-indigo-200/20 blur-3xl" />

      <div className="relative grid gap-8 p-6 md:p-8 lg:grid-cols-[1.4fr_0.9fr] lg:items-center">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-200/60 bg-white/80 px-3 py-1 text-xs font-medium text-indigo-700 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Student progress dashboard
          </div>

          <h1 className="max-w-2xl text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Keep your SHSAT prep focused, measurable, and consistent.
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
            Track your recent performance, spot weak areas faster, and turn
            today’s practice into a clearer study direction.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              asChild
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm hover:opacity-95"
            >
              <Link href="/exams">
                Start new exam
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="rounded-xl border-slate-200 bg-white/80 text-slate-700"
            >
              <Link href="/practice">Practice weak topics</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-4 backdrop-blur">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <TrendingUp className="h-4 w-4 text-indigo-600" />
              Overall accuracy
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              {pct(data.totals.accuracy)}%
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Based on your submitted work
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-4 backdrop-blur">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <Target className="h-4 w-4 text-violet-600" />
              Questions answered
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              {data.totals.questionsAnswered}
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {minutesToHMM(data.totals.minutes)} total study time
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-4 backdrop-blur">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <Sparkles className="h-4 w-4 text-fuchsia-500" />
              Focus today
            </div>
            <div className="mt-2 text-lg font-semibold text-slate-900">
              {weakest?.category ?? "Keep practicing"}
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {weakest
                ? `${pct(weakest.accuracy)}% accuracy • best next review area`
                : "No weak-area data yet"}
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
