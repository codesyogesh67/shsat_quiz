"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  ChevronRight,
  Layers3,
  Play,
  Shuffle,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CategoryItem = {
  name: string;
  count: number;
};

type PracticeOption = {
  key: string;
  label: string;
  count: number;
  kind: "single" | "mixed";
};

type Props = {
  categories: CategoryItem[];
  onStartCategory: (category: string, count?: number, minutes?: number) => void;
  title?: string;
  subtitle?: string;
  mixedLabel?: string;
  mixedDescription?: string;
};

type QuickPreset = {
  id: string;
  label: string;
  description: string;
  questions: number;
  minutes: number;
};

function getCategoryDescription(name: string) {
  switch (name) {
    case "Algebra":
      return "Equations, expressions, variables, and number relationships.";
    case "Arithmetic":
      return "Operations, ratios, percentages, and word problems.";
    case "Geometry":
      return "Angles, shapes, area, perimeter, and coordinate reasoning.";
    case "Probability and Statistics":
      return "Data interpretation, averages, and probability concepts.";
    default:
      return "Focused topic practice to strengthen this category.";
  }
}

function getSuggestedSetSize(count: number) {
  if (count >= 57) return 20;
  if (count >= 40) return 12;
  if (count >= 20) return 10;
  if (count >= 10) return 8;
  return Math.max(5, count);
}

export default function CategoryPracticeCard({
  categories,
  onStartCategory,
  title = "Practice by Topic",
  subtitle = "Choose one category or a mixed review set, then set your questions and timer.",
  mixedLabel = "Mixed Review",
  mixedDescription = "A balanced set of questions from multiple SHSAT math categories for broader revision.",
}: Props) {
  const visibleCategories = React.useMemo(
    () => categories.filter((c) => c.count > 0),
    [categories]
  );

  const totalQuestions = React.useMemo(
    () => visibleCategories.reduce((sum, item) => sum + item.count, 0),
    [visibleCategories]
  );

  const options = React.useMemo<PracticeOption[]>(() => {
    const singleOptions: PracticeOption[] = visibleCategories.map(
      (category) => ({
        key: category.name,
        label: category.name,
        count: category.count,
        kind: "single",
      })
    );

    if (!singleOptions.length) return [];

    return [
      {
        key: "mixed",
        label: mixedLabel,
        count: totalQuestions,
        kind: "mixed",
      },
      ...singleOptions,
    ];
  }, [visibleCategories, mixedLabel, totalQuestions]);

  const [selectedKey, setSelectedKey] = React.useState(options[0]?.key ?? "");

  React.useEffect(() => {
    if (!options.length) {
      setSelectedKey("");
      return;
    }

    const stillExists = options.some((option) => option.key === selectedKey);

    if (!stillExists) {
      setSelectedKey(options[0].key);
    }
  }, [options, selectedKey]);

  const selectedOption =
    options.find((option) => option.key === selectedKey) ?? null;

  const suggestedCount = selectedOption
    ? getSuggestedSetSize(selectedOption.count)
    : 10;

  const [questionCount, setQuestionCount] = React.useState(suggestedCount);
  const [minutes, setMinutes] = React.useState(12);

  React.useEffect(() => {
    if (selectedOption) {
      setQuestionCount(getSuggestedSetSize(selectedOption.count));
    }
  }, [selectedOption]);

  function handleQuestionCountChange(value: string) {
    const parsed = Number(value);

    if (Number.isNaN(parsed)) {
      setQuestionCount(1);
      return;
    }

    const maxAllowed = selectedOption?.count ?? 1;
    const clamped = Math.max(1, Math.min(parsed, maxAllowed));
    setQuestionCount(clamped);
  }

  function handleMinutesChange(value: string) {
    const parsed = Number(value);

    if (Number.isNaN(parsed)) {
      setMinutes(1);
      return;
    }

    const clamped = Math.max(1, Math.min(parsed, 180));
    setMinutes(clamped);
  }

  const selectedDescription =
    selectedOption?.kind === "mixed"
      ? mixedDescription
      : selectedOption
      ? getCategoryDescription(selectedOption.label)
      : "";

  const maxQuestions = selectedOption?.count ?? 0;

  const quickPresets: QuickPreset[] = React.useMemo(
    () => [
      {
        id: "mini",
        label: "Mini Practice",
        description: "20 questions · 25 min",
        questions: 20,
        minutes: 25,
      },
      {
        id: "focus",
        label: "Focused Practice",
        description: "40 questions · 50 min",
        questions: 40,
        minutes: 50,
      },
      {
        id: "full",
        label: "Full SHSAT Exam",
        description: "57 questions · 90 min",
        questions: 57,
        minutes: 90,
      },
    ],
    []
  );

  function applyPreset(preset: QuickPreset) {
    const cappedQuestions = Math.max(
      1,
      Math.min(preset.questions, selectedOption?.count ?? preset.questions)
    );

    setQuestionCount(cappedQuestions);
    setMinutes(preset.minutes);
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-3xl border border-slate-200/70 bg-white shadow-sm"
    >
      <div className="border-b border-slate-200/70 px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <BookOpen className="h-5 w-5" />
            </span>

            <div className="min-w-0">
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                {title}
              </h2>
              <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            </div>
          </div>

          <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600">
            <Layers3 className="mr-1.5 h-3.5 w-3.5" />
            {options.length} options
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {options.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-sm text-slate-500">
              No practice options are available yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)]">
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Category
                </label>

                <Select value={selectedKey} onValueChange={setSelectedKey}>
                  <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-white text-left shadow-none transition-all duration-200 hover:bg-slate-50 focus:ring-2 focus:ring-indigo-500/20">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>

                  <SelectContent className="rounded-2xl border-slate-200">
                    {options.map((option) => (
                      <SelectItem
                        key={option.key}
                        value={option.key}
                        className="rounded-xl"
                      >
                        <div className="flex min-w-[240px] items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            {option.kind === "mixed" ? (
                              <Shuffle className="h-3.5 w-3.5 text-slate-500" />
                            ) : null}
                            <span className="truncate text-slate-800">
                              {option.label}
                            </span>
                          </div>

                          <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                            {option.count} Qs
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedOption && (
                <div className="rounded-2xl border border-slate-200/70 bg-white p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {selectedOption.kind === "mixed" ? (
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                            <Shuffle className="h-4 w-4" />
                          </span>
                        ) : null}

                        <h3 className="text-base font-semibold text-slate-900">
                          {selectedOption.label}
                        </h3>
                      </div>

                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {selectedDescription}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                      {selectedOption.count} questions available
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    Number of questions
                  </label>

                  <input
                    type="number"
                    min={1}
                    max={maxQuestions || 1}
                    value={questionCount}
                    onChange={(e) => handleQuestionCountChange(e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 outline-none transition-all duration-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20"
                  />

                  <p className="mt-2 text-xs text-slate-500">
                    Max available: {maxQuestions}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    Timer (minutes)
                  </label>

                  <input
                    type="number"
                    min={1}
                    max={180}
                    value={minutes}
                    onChange={(e) => handleMinutesChange(e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 outline-none transition-all duration-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20"
                  />

                  <p className="mt-2 text-xs text-slate-500">
                    Choose any duration that fits your session.
                  </p>
                </div>
              </div>

              <Button
                onClick={() =>
                  selectedOption &&
                  onStartCategory(selectedOption.key, questionCount, minutes)
                }
                disabled={!selectedOption}
                className="h-11 w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20 transition-all duration-200 hover:opacity-95"
              >
                Start Practice
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* RIGHT SIDE — QUICK PRACTICE */}
            <div className="rounded-3xl border border-slate-200/70 bg-gradient-to-br from-slate-50 to-white p-4 sm:p-5">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-900">
                  Quick Practice
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Start a ready-made session instantly.
                </p>
              </div>

              <div className="space-y-3">
                {quickPresets.map((preset) => {
                  const exceedsAvailable = preset.questions > maxQuestions;

                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        if (!selectedOption) return;

                        const finalQuestions = Math.max(
                          1,
                          Math.min(preset.questions, selectedOption.count)
                        );

                        onStartCategory(
                          selectedOption.key,
                          finalQuestions,
                          preset.minutes
                        );
                      }}
                      disabled={!selectedOption || maxQuestions === 0}
                      className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left transition-all duration-200 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                              <Play className="h-4 w-4" />
                            </span>

                            <div>
                              <p className="text-sm font-semibold text-slate-900">
                                {preset.label}
                              </p>
                              <p className="text-xs text-slate-500">
                                {preset.description}
                              </p>
                            </div>
                          </div>
                        </div>

                        <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                          {preset.questions} / {preset.minutes}m
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.section>
  );
}
