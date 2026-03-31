"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, BarChart3 } from "lucide-react";

type Props = {
  title?: string;
  message?: string;
  target: string;
  delayMs?: number;
};

export default function PendingResultsRedirect({
  title = "Preparing your results",
  message = "Your report is being finalized.",
  target,
  delayMs = 2500,
}: Props) {
  const router = useRouter();

  React.useEffect(() => {
    const t = setTimeout(() => {
      router.replace(target);
    }, delayMs);

    return () => clearTimeout(t);
  }, [router, target, delayMs]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(40rem_20rem_at_15%_15%,rgba(99,102,241,0.10),transparent_60%),radial-gradient(36rem_18rem_at_85%_20%,rgba(139,92,246,0.10),transparent_60%),radial-gradient(28rem_16rem_at_50%_100%,rgba(236,72,153,0.06),transparent_60%)]"
      />

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative w-full max-w-lg"
      >
        <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-sm backdrop-blur-xl sm:p-8">
          <div className="mb-6 flex items-center justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-violet-600" />
              SHSAT Guide Report
            </div>
          </div>

          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20">
            <BarChart3 className="h-8 w-8" />
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              {title}
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-[15px]">
              {message}
            </p>
          </div>

          <div className="mt-8 space-y-3">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Building performance summary</span>
              <span>Please wait…</span>
            </div>

            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
              <motion.div
                initial={{ x: "-45%" }}
                animate={{ x: "140%" }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="h-full w-1/2 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-500"
              />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <StatusPill label="Scoring" active />
            <StatusPill label="Insights" active />
            <StatusPill label="Recommendations" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function StatusPill({
  label,
  active = false,
}: {
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={[
        "flex items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-xs font-medium transition-all duration-200",
        active
          ? "border-indigo-200 bg-indigo-50 text-indigo-700"
          : "border-slate-200 bg-slate-50 text-slate-500",
      ].join(" ")}
    >
      <span
        className={[
          "h-2 w-2 rounded-full",
          active ? "bg-indigo-600" : "bg-slate-300",
        ].join(" ")}
      />
      <span>{label}</span>
    </div>
  );
}
