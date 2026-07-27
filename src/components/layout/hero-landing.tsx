"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileBarChart2,
  PencilLine,
  Sparkles,
  LayoutGrid,
  TrendingUp,
} from "lucide-react";

const features = [
  {
    icon: PencilLine,
    title: "Daily Practice",
    desc:
      "Adaptive math problems that adjust to your child's level every session.",
  },
  {
    icon: FileBarChart2,
    title: "Real Past Exams",
    desc: "Practice with official retired SHSAT questions, not guesswork.",
  },
  {
    icon: LayoutGrid,
    title: "Practice by Category",
    desc: "Drill algebra, geometry, or word problems — one topic at a time.",
  },
  {
    icon: TrendingUp,
    title: "Progress Dashboard",
    desc: "Track exactly which skills are improving and what needs more work.",
  },
];

const schools = [
  { name: "Stuyvesant HS", score: 561 },
  { name: "Queens Sci @ York", score: 531 },
  { name: "Bronx Science", score: 525 },
  { name: "Staten Island Tech", score: 517 },
  { name: "Brooklyn Tech", score: 506 },
];

export default function HeroLanding() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60rem_35rem_at_15%_-10%,rgba(99,102,241,0.16),transparent_55%),radial-gradient(42rem_24rem_at_85%_0%,rgba(139,92,246,0.12),transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-indigo-300/70 to-transparent"
      />

      {/* ---------------- Hero ---------------- */}
      <div className="mx-auto max-w-7xl px-3 sm:px-6 md:px-10 lg:px-20 xl:px-28 pt-10 pb-14 md:pt-16 md:pb-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_.85fr]">
          <div className="max-w-3xl">
            <Badge
              variant="secondary"
              className="mb-5 rounded-full border border-indigo-200 bg-white/80 px-4 py-1 text-slate-700 shadow-sm backdrop-blur"
            >
              <Sparkles className="mr-2 h-3.5 w-3.5 text-indigo-600" />
              Built for SHSAT Math Success
            </Badge>

            <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl md:text-6xl">
              Diagnose weaknesses.{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                Build a smarter path to improvement.
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg md:text-xl">
              Start with a diagnostic, get a report card, and turn weak topics
              into focused daily progress.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/diagnostic">
                  <FileBarChart2 className="mr-2 h-4 w-4" />
                  Take Diagnostic
                </Link>
              </Button>

              <Button asChild size="lg" variant="outline">
                <Link href="/practice">
                  <PencilLine className="mr-2 h-4 w-4" />
                  Practice by Topic / Old Exam
                </Link>
              </Button>
            </div>
          </div>

          <div className="flex lg:justify-end">
            <div className="w-full max-w-[440px] rounded-[28px] border border-slate-200/80 bg-white/85 p-7 shadow-[0_20px_60px_-20px_rgba(79,70,229,0.25)] backdrop-blur-xl">
              <div className="text-[10px] uppercase tracking-[0.3em] text-slate-400 border-b border-slate-200 pb-2 mb-3">
                2026 Cutoff Scores
              </div>
              <div className="text-2xl font-bold text-slate-950 mb-4 leading-tight">
                The Numbers That Decide Your Child&apos;s Future.
              </div>
              <div className="space-y-2 border-t border-slate-200 pt-3">
                {schools.map((s) => (
                  <div
                    key={s.name}
                    className="flex justify-between items-baseline border-b border-slate-100 pb-2"
                  >
                    <span className="text-slate-800 font-semibold">
                      {s.name}
                    </span>
                    <span className="text-3xl font-bold text-indigo-600">
                      {s.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- Features ---------------- */}
      <div className="relative mx-auto max-w-7xl px-3 sm:px-6 md:px-10 lg:px-20 xl:px-28 pb-14 md:pb-20">
        <div className="grid md:grid-cols-4 gap-8 border-t border-slate-200 pt-14">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="text-center">
                <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-indigo-600">
                  <Icon className="h-7 w-7 text-white" />
                </div>
                <div className="mt-5 font-bold text-lg text-slate-950">
                  {f.title}
                </div>
                <div className="mt-2 text-sm text-slate-600">{f.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
