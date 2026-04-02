"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  FileBarChart2,
  PencilLine,
  Sparkles,
  BarChart3,
  Clock3,
  Target,
} from "lucide-react";

type Tone = "aspirational" | "energetic" | "minimal" | "supportive";

const COPY: Record<
  Tone,
  { title: React.ReactNode; sub: React.ReactNode; badge?: string }
> = {
  aspirational: {
    badge: "Built for SHSAT Math Success",
    title: (
      <>
        Diagnose weaknesses.{" "}
        <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
          Build a smarter path to improvement.
        </span>
      </>
    ),
    sub: (
      <>
        Start with a diagnostic, get a report card, and turn weak topics into
        focused daily progress.
      </>
    ),
  },
  energetic: {
    badge: "Built for SHSAT Math Success",
    title: (
      <>
        Stop practicing blindly.{" "}
        <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
          Start with a diagnostic.
        </span>
      </>
    ),
    sub: (
      <>
        See weak areas, follow a smarter study plan, and train with purpose
        using real SHSAT-style math practice.
      </>
    ),
  },
  minimal: {
    badge: "Built for SHSAT Math Success",
    title: (
      <>
        Diagnose. <span className="text-slate-400">Practice.</span>{" "}
        <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
          Improve.
        </span>
      </>
    ),
    sub: (
      <>
        A serious SHSAT math prep system with diagnostic testing, targeted
        practice, and progress tracking.
      </>
    ),
  },
  supportive: {
    badge: "Built for SHSAT Math Success",
    title: (
      <>
        Build real{" "}
        <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
          SHSAT math confidence
        </span>{" "}
        with a clear starting point.
      </>
    ),
    sub: (
      <>
        Help students understand what to study next with a diagnostic report,
        targeted drills, and guided progress.
      </>
    ),
  },
};

const TONES: Tone[] = ["aspirational", "energetic", "minimal", "supportive"];

const quickStats = [
  {
    icon: Target,
    label: "Target weak areas",
    value: "Focused plan",
  },
  {
    icon: BarChart3,
    label: "Track progress",
    value: "Smart reporting",
  },
  {
    icon: Clock3,
    label: "Study efficiently",
    value: "Daily direction",
  },
];

export default function HeroLanding({ tone }: { tone?: Tone }) {
  const [activeTone, setActiveTone] = React.useState<Tone>(
    tone ?? "aspirational"
  );

  React.useEffect(() => {
    if (tone) return;
    try {
      const key = "heroToneIndex";
      const last = Number(localStorage.getItem(key) || "0");
      const next = Number.isFinite(last) ? (last + 1) % TONES.length : 0;
      localStorage.setItem(key, String(next));
      setActiveTone(TONES[next]);
    } catch {
      setActiveTone("aspirational");
    }
  }, [tone]);

  const { title, sub, badge } = COPY[activeTone];

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

      <div className="mx-auto max-w-7xl px-3 sm:px-6 md:px-10 lg:px-20 xl:px-28 pt-10 pb-14 md:pt-16 md:pb-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_.85fr]">
          <div className="max-w-3xl">
            {badge && (
              <Badge
                variant="secondary"
                className="mb-5 rounded-full border border-indigo-200 bg-white/80 px-4 py-1 text-slate-700 shadow-sm backdrop-blur"
              >
                <Sparkles className="mr-2 h-3.5 w-3.5 text-indigo-600" />
                {badge}
              </Badge>
            )}

            <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl md:text-6xl">
              {title}
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg md:text-xl">
              {sub}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-slate-500">
              <span>Diagnostic report card</span>
              <span className="hidden sm:inline">•</span>
              <span>Weak topic analysis</span>
              <span className="hidden sm:inline">•</span>
              <span>Targeted SHSAT practice</span>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/diagnostic">
                  <FileBarChart2 className="mr-2 h-4 w-4" />
                  Take Diagnostic
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                // className="rounded-xl border-slate-300 bg-white/80 px-6 text-slate-700 backdrop-blur hover:bg-slate-50"
              >
                <Link href="/practice">
                  <PencilLine className="mr-2 h-4 w-4" />
                  Practice by Topic
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="ghost"
                className="rounded-xl px-4 text-slate-700 hover:bg-slate-100/80"
              >
                <Link href="/practice">
                  Full Exam
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {quickStats.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/70 bg-white/75 p-4 shadow-sm backdrop-blur"
                  >
                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-sm font-semibold text-slate-900">
                      {item.value}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {item.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex lg:justify-end">
            <div className="w-full max-w-[440px] rounded-[28px] border border-slate-200/80 bg-white/85 p-5 shadow-[0_20px_60px_-20px_rgba(79,70,229,0.25)] backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Student Snapshot
                  </p>
                  <p className="text-xs text-slate-500">
                    What the dashboard will feel like
                  </p>
                </div>
                <div className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                  Preview
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-5 text-white">
                  <div className="text-xs uppercase tracking-[0.18em] text-white/60">
                    Estimated Readiness
                  </div>
                  <div className="mt-2 text-3xl font-bold">Developing</div>
                  <div className="mt-4 h-2 rounded-full bg-white/10">
                    <div className="h-2 w-[58%] rounded-full bg-gradient-to-r from-indigo-400 to-fuchsia-400" />
                  </div>
                  <div className="mt-2 text-xs text-white/70">
                    58% readiness based on recent diagnostic
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                    <div className="text-xs text-slate-500">Weakest topic</div>
                    <div className="mt-1 text-lg font-semibold text-slate-900">
                      Algebra
                    </div>
                    <div className="mt-2 text-xs text-rose-600">
                      Needs attention
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                    <div className="text-xs text-slate-500">This week</div>
                    <div className="mt-1 text-lg font-semibold text-slate-900">
                      3 sessions
                    </div>
                    <div className="mt-2 text-xs text-emerald-600">
                      Study plan active
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900">
                      Recommended next step
                    </p>
                    <span className="text-xs text-slate-500">Today</span>
                  </div>
                  <p className="text-sm leading-6 text-slate-600">
                    Practice 10 algebra questions, then review 2 mistake types
                    from your latest report.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
