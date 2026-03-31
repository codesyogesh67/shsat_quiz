"use client";

import { motion } from "framer-motion";
import { Activity, Sparkles, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  title: string;
  subtitle: string;
  onStartMixedPractice: () => void;
  onStartDiagnostic: () => void;
};

export default function PracticeCenterHeader({
  title,
  subtitle,
  onStartMixedPractice,
  onStartDiagnostic,
}: Props) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="overflow-hidden"
    >
      <div>
        <div className="flex flex-col gap-6 px-5 py-6 sm:px-6 sm:py-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                Premium Practice Experience
              </span>

              <span className="inline-flex items-center rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-xs font-medium text-slate-600">
                SHSAT Math Training
              </span>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {title}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-[15px]">
              {subtitle}
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-sm">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <Target className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Focused by category
                </h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Practice specific topics like Algebra, Geometry, and more.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-sm">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <Activity className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Timed sessions
                </h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Train with structured timers to build speed and confidence.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-sm">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Smart progress
                </h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Use diagnostics and review sessions to strengthen weak areas.
                </p>
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 lg:w-[280px]">
            <Button
              onClick={onStartMixedPractice}
              className="h-11 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20 hover:opacity-95"
            >
              Start Mixed Practice
            </Button>

            <Button
              variant="outline"
              onClick={onStartDiagnostic}
              className="h-11 rounded-2xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            >
              Start Diagnostic
            </Button>

            <p className="px-1 text-xs leading-5 text-slate-500">
              Choose a quick path to begin immediately, or explore more practice
              options below.
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
