"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CategoryStat } from "./types";
import { pct } from "./utils";
import { ArrowRight, Brain, Flag, Target } from "lucide-react";

type Props = {
  categories: CategoryStat[];
};

const actions = [
  {
    title: "Practice weak topics",
    description: "Focus on your lowest-performing categories.",
    href: "/practice",
    icon: Target,
    iconStyle:
      "bg-gradient-to-br from-indigo-500/15 to-violet-500/15 text-indigo-700",
  },
  {
    title: "Review flagged questions",
    description: "Revisit questions you marked earlier.",
    href: "/review?filter=flagged",
    icon: Flag,
    iconStyle:
      "bg-gradient-to-br from-amber-500/15 to-orange-500/15 text-amber-700",
  },
  {
    title: "Study with guidance",
    description: "Unlock structured explanations and study flows.",
    href: "/pricing",
    icon: Brain,
    iconStyle:
      "bg-gradient-to-br from-violet-500/15 to-fuchsia-500/15 text-violet-700",
  },
];

function getTone(accuracy: number) {
  if (accuracy >= 0.8) {
    return {
      badge:
        "border-emerald-200 bg-emerald-50/90 text-emerald-700 shadow-sm shadow-emerald-100/60",
      bar: "bg-emerald-500",
      ring: "from-emerald-500/10 to-transparent",
      label: "Strong",
    };
  }

  if (accuracy >= 0.6) {
    return {
      badge:
        "border-amber-200 bg-amber-50/90 text-amber-700 shadow-sm shadow-amber-100/60",
      bar: "bg-amber-500",
      ring: "from-amber-500/10 to-transparent",
      label: "Improving",
    };
  }

  return {
    badge:
      "border-rose-200 bg-rose-50/90 text-rose-700 shadow-sm shadow-rose-100/60",
    bar: "bg-rose-500",
    ring: "from-rose-500/10 to-transparent",
    label: "Needs focus",
  };
}

export function TopicFocusList({ categories }: Props) {
  const sorted = [...categories].sort((a, b) => a.accuracy - b.accuracy);

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200/70 bg-white shadow-[0_10px_40px_rgba(15,23,42,0.06)]">
      {/* HEADER */}
      <div className="relative border-b border-slate-200/70 px-5 py-5 sm:px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.10),transparent_35%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.08),transparent_35%)]" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <h2 className="bg-gradient-to-r from-slate-900 via-indigo-900 to-violet-900 bg-clip-text text-lg font-semibold tracking-tight text-transparent sm:text-xl">
              Topic Focus
            </h2>
            <p className="mt-1 max-w-xl text-sm leading-6 text-slate-600">
              Prioritize weaker categories first to raise your score faster and
              build a stronger overall foundation.
            </p>
          </div>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-xl border-slate-200 bg-white/80 text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <Link href="/practice">All practice</Link>
          </Button>
        </div>
      </div>

      {/* CATEGORY GRID */}
      <div className="px-5 py-5 sm:px-6 sm:py-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sorted.map((item, index) => {
            const tone = getTone(item.accuracy);

            return (
              <motion.div
                key={`${item.category}-${index}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04, duration: 0.3 }}
                className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.92))] p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${tone.ring} opacity-100`}
                />

                <div className="relative">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold tracking-tight text-slate-900 sm:text-[15px]">
                          {item.category}
                        </h3>
                        <Badge
                          className={`${tone.badge} rounded-full px-2.5 py-0.5 text-[10px] font-medium`}
                        >
                          {tone.label}
                        </Badge>
                      </div>

                      <p className="mt-1 text-xs font-medium text-slate-500">
                        {item.correct} correct out of {item.attempted} attempted
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-base font-semibold tracking-tight text-slate-900">
                        {pct(item.accuracy)}%
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="h-2 overflow-hidden rounded-full bg-slate-200/80">
                      <div
                        className={`h-full rounded-full ${tone.bar}`}
                        style={{ width: `${pct(item.accuracy)}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-5 flex justify-center">
                    <Button
                      asChild
                      size="sm"
                      className="min-w-[140px] rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20 transition hover:opacity-90"
                    >
                      <Link
                        href={`/practice?mode=practice&recommended=${encodeURIComponent(
                          item.category
                        )}`}
                      >
                        <Target className="mr-2 h-4 w-4" />
                        Practice
                      </Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ACTIONS LOWER SECTION */}
      <div className="border-t border-slate-200/70 bg-slate-50/60 px-5 py-5 sm:px-6">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {actions.map((action) => {
            const Icon = action.icon;

            return (
              <Link
                key={action.title}
                href={action.href}
                className="group flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white px-4 py-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${action.iconStyle}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold tracking-tight text-slate-900">
                      {action.title}
                    </p>
                    <p className="mt-0.5 text-xs leading-5 text-slate-500">
                      {action.description}
                    </p>
                  </div>
                </div>

                <ArrowRight className="ml-3 h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-600" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
