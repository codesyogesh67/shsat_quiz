import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type KpiTone = "indigo" | "violet" | "fuchsia" | "orange" | "slate";

function getToneClasses(tone: KpiTone) {
  switch (tone) {
    case "indigo":
      return {
        glow:
          "bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.16),transparent_42%)]",
        iconWrap:
          "border-indigo-200/70 bg-indigo-50 text-indigo-700 shadow-[0_8px_24px_rgba(99,102,241,0.12)]",
        accent: "from-indigo-500/70 to-violet-500/40",
      };

    case "violet":
      return {
        glow:
          "bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.16),transparent_42%)]",
        iconWrap:
          "border-violet-200/70 bg-violet-50 text-violet-700 shadow-[0_8px_24px_rgba(139,92,246,0.12)]",
        accent: "from-violet-500/70 to-fuchsia-500/40",
      };

    case "fuchsia":
      return {
        glow:
          "bg-[radial-gradient(circle_at_top_left,rgba(217,70,239,0.16),transparent_42%)]",
        iconWrap:
          "border-fuchsia-200/70 bg-fuchsia-50 text-fuchsia-700 shadow-[0_8px_24px_rgba(217,70,239,0.12)]",
        accent: "from-fuchsia-500/70 to-pink-500/40",
      };

    case "orange":
      return {
        glow:
          "bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.16),transparent_42%)]",
        iconWrap:
          "border-orange-200/70 bg-orange-50 text-orange-700 shadow-[0_8px_24px_rgba(249,115,22,0.12)]",
        accent: "from-orange-500/70 to-amber-500/40",
      };

    default:
      return {
        glow:
          "bg-[radial-gradient(circle_at_top_left,rgba(148,163,184,0.14),transparent_42%)]",
        iconWrap:
          "border-slate-200/80 bg-slate-50 text-slate-700 shadow-[0_8px_24px_rgba(15,23,42,0.06)]",
        accent: "from-slate-400/70 to-slate-300/40",
      };
  }
}

export function KPI({
  label,
  value,
  sub,
  icon,
  className,
  tone = "slate",
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: React.ReactNode;
  className?: string;
  tone?: KpiTone;
}) {
  const styles = getToneClasses(tone);

  return (
    <Card
      className={cn(
        "group relative overflow-hidden rounded-[24px] border border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] shadow-[0_10px_35px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(15,23,42,0.10)]",
        className
      )}
    >
      <div
        className={cn("pointer-events-none absolute inset-0", styles.glow)}
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r opacity-80",
          styles.accent
        )}
      />

      <CardContent className="relative p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              {label}
            </p>

            <div className="mt-3">
              <p className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[1.9rem]">
                {value}
              </p>
            </div>

            {sub ? (
              <p className="mt-2 text-xs leading-5 text-slate-600">{sub}</p>
            ) : null}
          </div>

          {icon ? (
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition-all duration-300 group-hover:scale-105",
                styles.iconWrap
              )}
            >
              {icon}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
