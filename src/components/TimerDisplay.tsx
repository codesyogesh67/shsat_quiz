"use client";

import { useEffect, useRef, useState } from "react";
import type { TimerDisplayProps } from "@/types";

export default function TimerDisplay({
  durationSec,
  running,
  onTimeUp,
}: TimerDisplayProps) {
  const [remaining, setRemaining] = useState<number>(durationSec);
  const endAtRef = useRef<number | null>(null);

  // Reset when duration changes
  useEffect(() => {
    setRemaining(durationSec);
    endAtRef.current = null;
  }, [durationSec]);

  // Ticker
  useEffect(() => {
    if (!running) return;

    if (endAtRef.current == null) {
      endAtRef.current = Date.now() + remaining * 1000;
    }

    const tick = () => {
      const left = Math.max(
        0,
        Math.round((endAtRef.current! - Date.now()) / 1000)
      );
      setRemaining(left);
      if (left === 0) onTimeUp();
    };

    const id = setInterval(tick, 250);
    tick();
    return () => clearInterval(id);
  }, [running, onTimeUp]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  return (
    <div
      className={[
        "rounded-xl border px-3 py-1.5 text-sm font-semibold tabular-nums",
        remaining <= 60
          ? "border-rose-300 text-rose-600"
          : "border-neutral-200 text-neutral-800",
      ].join(" ")}
      aria-live="polite"
    >
      ⏱ {mm}:{ss}
    </div>
  );
}
