"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Clock3,
  FileSpreadsheet,
  Settings2,
  Sparkles,
  TimerReset,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type CategoryItem = {
  name: string;
  count: number;
};

type ExamPreset = {
  key: string;
  label: string;
  description?: string;
  count: number;
  minutes: number;
};

type CustomStartArgs = {
  category?: string;
  count: number;
  minutes: number;
};

type Props = {
  categories: CategoryItem[];
  examPresets: ExamPreset[];
  onStartExamPreset: (preset: ExamPreset) => void;
  onStartCustom: (args: CustomStartArgs) => void;
};

const QUESTION_OPTIONS = [10, 15, 20, 30, 40, 57];
const MINUTE_OPTIONS = [12, 20, 30, 45, 60, 90];

export default function ExamAndCustomCard({
  categories,
  examPresets,
  onStartExamPreset,
  onStartCustom,
}: Props) {
  const availableCategories = React.useMemo(
    () => categories.filter((item) => item.count > 0),
    [categories]
  );

  const [selectedCategory, setSelectedCategory] = React.useState("mixed");
  const [selectedCount, setSelectedCount] = React.useState(10);
  const [selectedMinutes, setSelectedMinutes] = React.useState(12);

  function handleReset() {
    setSelectedCategory("mixed");
    setSelectedCount(10);
    setSelectedMinutes(12);
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut", delay: 0.08 }}
      className="space-y-6"
    >
      <div className="rounded-3xl border border-slate-200/70 bg-white shadow-sm">
        <div className="border-b border-slate-200/70 px-5 py-5 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <FileSpreadsheet className="h-5 w-5" />
                </span>

                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                    Exam Simulation
                  </h2>
                  <p className="text-sm text-slate-500">
                    Start a structured timed session that feels closer to test
                    day.
                  </p>
                </div>
              </div>
            </div>

            <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              Premium Mode
            </span>
          </div>
        </div>

        <div className="space-y-4 p-5 sm:p-6">
          {examPresets.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <p className="text-sm text-slate-500">
                No exam presets available right now.
              </p>
            </div>
          ) : (
            examPresets.map((preset, index) => (
              <motion.div
                key={preset.key}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.22,
                  ease: "easeOut",
                  delay: 0.08 + index * 0.03,
                }}
                className="rounded-3xl border border-slate-200/70 bg-gradient-to-br from-white to-slate-50/70 p-5 transition-all duration-200 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-500/10"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-slate-900">
                        {preset.label}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {preset.description ??
                          "Timed exam-style session with mixed SHSAT math questions."}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700">
                        {preset.count} questions
                      </span>
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700">
                        {preset.minutes} min
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-white px-3 py-3 ring-1 ring-slate-200">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                        Format
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        Mixed exam
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white px-3 py-3 ring-1 ring-slate-200">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                        Pacing
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        Timed pressure
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white px-3 py-3 ring-1 ring-slate-200">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                        Best For
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        Full simulation
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => onStartExamPreset(preset)}
                      className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20 hover:opacity-95"
                    >
                      Start Exam
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </motion.section>
  );
}
