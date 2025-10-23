// components/hero-landing.tsx
"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import LandingTeaserQuestion from "./LandingTeaserQuestion";

type Tone = "aspirational" | "energetic" | "minimal" | "supportive";

const COPY: Record<
  Tone,
  { title: React.ReactNode; sub: React.ReactNode; badge?: string }
> = {
  aspirational: {
    badge: "Built for SHSAT MATH",
    title: (
      <>
        Master the SHSAT Math.{" "}
        <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          One smart session at a time.
        </span>
      </>
    ),
    sub: (
      <>
        Practice smarter with adaptive drills, instant feedback, and real exam
        questions — built for NYC students who want results that last.
      </>
    ),
  },
  energetic: {
    badge: "Built for SHSAT MATH",
    title: (
      <>
        Turn SHSAT Math into{" "}
        <span className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">
          your strongest subject
        </span>
        .
      </>
    ),
    sub: (
      <>
        Stop guessing and start mastering. Timed drills, real questions, and
        smart analytics designed to improve you faster every day.
      </>
    ),
  },
  minimal: {
    badge: "Built for SHSAT MATH",
    title: (
      <>
        Practice. <span className="text-muted-foreground">Analyze.</span>{" "}
        <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
          Improve.
        </span>
      </>
    ),
    sub: (
      <>
        Real SHSAT Math questions with progress tracking and custom timers.
        Train like test day is today.
      </>
    ),
  },
  supportive: {
    badge: "Built for SHSAT MATH",
    title: (
      <>
        Build real{" "}
        <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
          math confidence
        </span>{" "}
        for the SHSAT.
      </>
    ),
    sub: (
      <>
        Practice smarter — not longer. Learn from every question, track weak
        spots, and watch your progress grow week by week.
      </>
    ),
  },
};

// Round-robin list for rotation
const TONES: Tone[] = ["aspirational", "energetic", "minimal", "supportive"];

export default function HeroLanding({ tone }: { tone?: Tone }) {
  // If a tone prop is passed, we honor it. Otherwise we rotate each visit.
  const [activeTone, setActiveTone] = React.useState<Tone>(
    tone ?? "aspirational"
  );

  React.useEffect(() => {
    if (tone) return; // locked by prop
    try {
      const key = "heroToneIndex";
      const last = Number(localStorage.getItem(key) || "0");
      const next = Number.isFinite(last) ? (last + 1) % TONES.length : 0;
      localStorage.setItem(key, String(next));
      setActiveTone(TONES[next]);
    } catch {
      // If localStorage fails, keep default
      setActiveTone((prev) => prev);
    }
  }, [tone]);

  const { title, sub, badge } = COPY[activeTone];

  return (
    <section className="relative overflow-hidden">
      {/* Subtle gradient backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60rem_40rem_at_50%_-10%,theme(colors.indigo.500/.15),transparent)]"
      />

      <div className="mx-auto max-w-7xl px-3 sm:px-6 md:px-10 lg:px-20 xl:px-28 pt-10 pb-12 md:pt-16 md:pb-16">
        <div className="mx-auto max-w-3xl text-center">
          {badge && (
            <Badge variant="secondary" className="mb-3">
              {badge}
            </Badge>
          )}

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            {title}
          </h1>

          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            {sub}
          </p>

          {/* Trust mini-row */}
          <div className="mt-5 flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span>Real past-exam style questions</span>
            <span className="select-none">•</span>
            <span>Custom timers</span>
            <span className="select-none">•</span>
            <span>Progress tracking</span>
          </div>

          {/* Primary CTAs (before teaser) */}
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            {/* Practice: make it obvious it's drill mode */}
            <Button asChild className="rounded-xl">
              <Link href="/practice" aria-label="Practice – Drill Mode">
                Practice — Drill Mode
              </Link>
            </Button>

            {/* Full Exams: clear “simulation” language */}
            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/exam" aria-label="Full Exam – Test Simulation">
                Full Exam — Test Simulation
              </Link>
            </Button>
          </div>

          <div className="mt-8 space-y-6">
            {/* Teaser question */}
            <LandingTeaserQuestion />
          </div>
        </div>
      </div>
    </section>
  );
}
