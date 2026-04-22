"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  ChevronRight,
  Shuffle,
  Play,
  Sparkles,
  TimerReset,
  Target,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

function getCategoryTheme(key: string) {
  switch (key) {
    case "mixed":
      return {
        icon: Shuffle,
        chip: "bg-white/15 text-indigo border-white/20",
        card:
          "from-indigo-600 via-violet-500 to-fuchsia-500 text-white border-indigo-400/30",
        // "from-indigo-500 via-indigo-600 to-violet-600 text-white border-indigo-400/30",
        lightCard:
          "border-indigo-200 bg-gradient-to-br from-indigo-50 via-violet-50 to-fuchsia-50",
        // iconWrap: "bg-white/15 text-white",
        iconWrap: "bg-indigo-100 text-indigo-700",
      };
    case "Algebra":
      return {
        icon: Target,
        chip: "bg-indigo-50 text-indigo-700 border-indigo-200",
        card:
          "from-indigo-500 via-indigo-600 to-violet-600 text-white border-indigo-400/30",
        lightCard:
          "border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-violet-50",
        iconWrap: "bg-indigo-100 text-indigo-700",
      };
    case "Arithmetic":
      return {
        icon: Sparkles,
        chip: "bg-emerald-50 text-emerald-700 border-emerald-200",
        card:
          "from-emerald-500 via-teal-500 to-cyan-500 text-white border-emerald-400/30",
        lightCard:
          "border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-cyan-50",
        iconWrap: "bg-emerald-100 text-emerald-700",
      };
    case "Geometry":
      return {
        icon: BarChart3,
        chip: "bg-amber-50 text-amber-700 border-amber-200",
        card:
          "from-amber-500 via-orange-500 to-rose-500 text-white border-orange-400/30",
        lightCard:
          "border-amber-200 bg-gradient-to-br from-amber-50 via-white to-rose-50",
        iconWrap: "bg-amber-100 text-amber-700",
      };
    case "Probability and Statistics":
      return {
        icon: BarChart3,
        chip: "bg-sky-50 text-sky-700 border-sky-200",
        card:
          "from-sky-500 via-cyan-500 to-blue-500 text-white border-sky-400/30",
        lightCard:
          "border-sky-200 bg-gradient-to-br from-sky-50 via-white to-blue-50",
        iconWrap: "bg-sky-100 text-sky-700",
      };
    default:
      return {
        icon: BookOpen,
        chip: "bg-slate-50 text-slate-700 border-slate-200",
        card:
          "from-slate-700 via-slate-800 to-slate-900 text-white border-slate-500/30",
        lightCard:
          "border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-100",
        iconWrap: "bg-slate-100 text-slate-700",
      };
  }
}

export default function CategoryPracticeCard({
  categories,
  onStartCategory,
  title = "Practice by Topic",
  subtitle = "Choose a topic, set your questions and timer, and start a focused SHSAT session.",
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

  const selectedTheme = getCategoryTheme(selectedOption?.key ?? "");

  const quickPresets: QuickPreset[] = React.useMemo(
    () => [
      {
        id: "mini",
        label: "Mini Practice",
        description: "Fast revision burst",
        questions: 20,
        minutes: 25,
      },
      {
        id: "focus",
        label: "Focused Practice",
        description: "Longer targeted training",
        questions: 40,
        minutes: 50,
      },
      {
        id: "full",
        label: "Full SHSAT Exam",
        description: "Complete exam-style session",
        questions: 57,
        minutes: 90,
      },
    ],
    []
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden rounded-[28px] border border-slate-200/70 bg-white shadow-[0_20px_80px_-40px_rgba(79,70,229,0.35)]"
    >
      <div className="relative overflow-hidden border-b border-indigo-400/20 px-5 py-4 sm:px-6">
        <div className="absolute inset-0" />
        <div className="absolute -right-10 top-0 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -left-6 bottom-0 h-20 w-20 rounded-full bg-fuchsia-400/20 blur-2xl" />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Icon + Title inline */}
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                <Target className="h-4.5 w-4.5" />
              </span>

              <h2 className="text-lg font-semibold tracking-tight sm:text-xl text-slate-900">
                {title}
              </h2>
            </div>

            {/* Tag closer + smaller */}
            <div className="ml-2 inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-indigo-600">
              <Sparkles className="h-3 w-3" />
              SHSAT PRACTICE ZONE
            </div>
          </div>
        </div>

        {/* Subtitle tighter */}
        <p className="relative mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>

      <div className="p-5 sm:p-6">
        {options.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-sm text-slate-500">
              No practice options are available yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_380px]">
            <div className="space-y-6">
              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <label className="text-sm font-semibold text-slate-800">
                    Choose a topic
                  </label>
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                    Tap a card to select
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {options.map((option) => {
                    const isSelected = selectedKey === option.key;
                    const theme = getCategoryTheme(option.key);
                    const Icon = theme.icon;

                    return (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => setSelectedKey(option.key)}
                        className={cn(
                          "group relative overflow-hidden rounded-[20px] border px-3 py-3 text-left transition-all duration-300",
                          isSelected
                            ? `bg-gradient-to-br ${theme.card} shadow-[0_12px_24px_-20px_rgba(79,70,229,0.25)] ring-1 ring-white/60`
                            : `${theme.lightCard} hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-20px_rgba(15,23,42,0.15)]`
                        )}
                      >
                        <div
                          className={cn(
                            "absolute inset-0 opacity-0 transition-opacity duration-300",
                            isSelected && "opacity-100",
                            "bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_28%)]"
                          )}
                        />

                        <div className="relative flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            {/* Title */}
                            <h3
                              className={cn(
                                "text-[14px] font-semibold leading-5",
                                isSelected
                                  ? "text-white font-extrabold"
                                  : "text-slate-900"
                              )}
                            >
                              {option.label}
                            </h3>

                            {/* Description (tighter) */}
                            <p
                              className={cn(
                                "mt-0.5 text-[12px] leading-4",
                                isSelected
                                  ? "text-slate-600 text-white font-medium"
                                  : "text-slate-500"
                              )}
                            >
                              {option.kind === "mixed"
                                ? mixedDescription
                                : getCategoryDescription(option.label)}
                            </p>
                          </div>

                          {/* Count */}
                          <span
                            className={cn(
                              "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                              isSelected
                                ? theme.chip
                                : "border-slate-200 bg-white/80 text-slate-700"
                            )}
                          >
                            {option.count}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-[26px] border border-slate-200 bg-gradient-to-br from-white to-indigo-50/40 p-4 shadow-sm">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                      <Target className="h-4 w-4" />
                    </span>
                    <div className="flex flex-col justify-center items-center">
                      {/* <span className="text-center shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold border-slate-200 bg-indigo-400 text-white">
                        {selectedOption.label}
                      </span> */}
                      <label className="text-sm font-semibold text-slate-800">
                        Number of questions
                      </label>
                    </div>
                  </div>

                  <input
                    type="number"
                    min={1}
                    max={maxQuestions || 1}
                    value={questionCount}
                    onChange={(e) => handleQuestionCountChange(e.target.value)}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition-all duration-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20"
                  />

                  <p className="mt-2 text-xs text-slate-500 leading-loose">
                    Set how many{" "}
                    <span className="text-white bg-indigo-500 font-bold text-md rounded-full border border-indigo-500 p-1 px-3">
                      {selectedOption?.label ?? "selected"}
                    </span>{" "}
                    questions you want in this session. Max available:{" "}
                    {maxQuestions}
                  </p>
                </div>

                <div className="rounded-[26px] border border-slate-200 bg-gradient-to-br from-white to-violet-50/40 p-4 shadow-sm">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                      <TimerReset className="h-4 w-4" />
                    </span>
                    <label className="text-sm font-semibold text-slate-800">
                      Timer (minutes)
                    </label>
                  </div>

                  <input
                    type="number"
                    min={1}
                    max={180}
                    value={minutes}
                    onChange={(e) => handleMinutesChange(e.target.value)}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition-all duration-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20"
                  />

                  <p className="mt-2 text-xs text-slate-500">
                    Choose a time limit that matches your practice intensity.
                  </p>
                </div>
              </div>

              <Button
                onClick={() =>
                  selectedOption &&
                  onStartCategory(selectedOption.key, questionCount, minutes)
                }
                disabled={!selectedOption}
                className="h-12 w-full rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white shadow-[0_18px_40px_-18px_rgba(99,102,241,0.65)] transition-all duration-200 hover:scale-[0.995] hover:opacity-95"
              >
                Start Practice
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="rounded-[28px] border border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-indigo-50/50 p-4 sm:p-5 shadow-sm">
              <div className="mb-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-700">
                  <Play className="h-3.5 w-3.5" />
                  Quick Start
                </div>

                <h3 className="mt-3 text-lg font-semibold text-slate-900">
                  Quick Practice
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Start a ready-made session instantly using your selected
                  topic.
                </p>
              </div>

              <div className="space-y-3">
                {quickPresets.map((preset, index) => {
                  const accentStyles = [
                    "from-indigo-50 to-violet-50 border-indigo-200 hover:border-indigo-300",
                    "from-emerald-50 to-cyan-50 border-emerald-200 hover:border-emerald-300",
                    "from-amber-50 to-rose-50 border-amber-200 hover:border-orange-300",
                  ];

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
                      className={cn(
                        "w-full rounded-3xl cursor-pointer border bg-gradient-to-br p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60",
                        accentStyles[index]
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
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

                        <span className="shrink-0 rounded-full border border-white/80 bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                          {preset.questions} Q · {preset.minutes}m
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 rounded-3xl border border-dashed border-indigo-200 bg-white/80 p-4">
                <p className="text-sm font-medium text-slate-800">Best flow:</p>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Pick a weak topic, do a short focused session, then come back
                  tomorrow and repeat with a different set size.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.section>
  );
}
