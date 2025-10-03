// components/hero-landing.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchJsonSafe } from "@/lib/fetchJsonSafe";
import ComingSoonLink from "@/components/ComingSoonLink";

// runtime guards (no TS types)
function isWithTotal(v) {
  return (
    typeof v === "object" &&
    v !== null &&
    "total" in v &&
    typeof v.total === "number"
  );
}
function isWithQuestionsUnknown(v) {
  return (
    typeof v === "object" &&
    v !== null &&
    "questions" in v &&
    Array.isArray(v.questions)
  );
}

export default function HeroLanding() {
  return (
    <section className="relative overflow-hidden">
      {/* Subtle gradient background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60rem_40rem_at_50%_-10%,theme(colors.indigo.500/.15),transparent)]"
      />
      <div className="mx-auto max-w-7xl px-3 sm:px-6 md:px-10 lg:px-20 xl:px-28 pt-10 pb-12 md:pt-16 md:pb-16">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="secondary" className="mb-3">
            NYC SHSAT Math
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            Ace SHSAT Math with Smart Practice
          </h1>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Sharpen weak spots, master pacing, and crush real past-exam
            questions. Start free and level up when you’re ready.
          </p>

          <div className="mt-8">
            <MiniConfigurator />
          </div>
        </div>
      </div>
    </section>
  );
}

function MiniConfigurator() {
  const router = useRouter();

  // inputs
  const [count, setCount] = React.useState(10);
  const [minutes, setMinutes] = React.useState(15);

  // live total across all categories
  const [maxCount, setMaxCount] = React.useState(1);

  // Fetch total once
  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await fetchJsonSafe("/api/questions?count=0");
        let total = 1;
        if (isWithTotal(data)) total = Math.max(1, data.total);
        else if (isWithQuestionsUnknown(data))
          total = Math.max(1, data.questions.length);
        if (alive) setMaxCount(total);
      } catch {
        if (alive) setMaxCount(1);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // clamp count when max changes
  React.useEffect(() => {
    setCount((c) => Math.max(1, Math.min(maxCount || 1, c)));
  }, [maxCount]);

  const goStartCustom = () => {
    const qs = new URLSearchParams({
      count: String(Math.max(1, Math.min(maxCount || 1, count || 1))),
      minutes: String(Math.max(1, Math.min(300, minutes || 1))),
      // randomize omitted on purpose; backend already randomizes
    });
    router.push(`/practice?${qs.toString()}`);
  };

  return (
    <div className="mx-auto max-w-3xl text-left">
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base sm:text-lg font-semibold">Quick Start</h3>
          <ComingSoonLink label="Advanced mode" />
        </div>

        {/* Two evenly-sized inputs; helper rows have same min-height to align columns */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Count */}
          <div className="grid gap-1.5">
            <label className="text-sm text-neutral-600"># of Questions</label>
            <input
              type="number"
              min={1}
              max={Math.max(1, maxCount)}
              value={count}
              onChange={(e) =>
                setCount(
                  Math.max(
                    1,
                    Math.min(maxCount || 1, Number(e.target.value) || 1)
                  )
                )
              }
              className="h-10 rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
            />
            <p className="text-xs text-neutral-500 min-h-[1rem]">
              Max available: {maxCount}
            </p>
          </div>

          {/* Minutes */}
          <div className="grid gap-1.5">
            <label className="text-sm text-neutral-600">Time (minutes)</label>
            <input
              type="number"
              min={1}
              max={300}
              value={minutes}
              onChange={(e) =>
                setMinutes(
                  Math.max(1, Math.min(300, Number(e.target.value) || 1))
                )
              }
              className="h-10 rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
            />
            {/* empty helper row to match height with left column */}
            <p className="text-xs text-transparent min-h-[1rem]">.</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button onClick={goStartCustom} className="rounded-xl">
            Start Custom Quiz
          </Button>
        </div>
      </div>
    </div>
  );
}
