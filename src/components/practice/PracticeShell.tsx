"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Brain, Sparkles } from "lucide-react";

import PracticeCenterHeader from "./PracticeCenterHeader";
import CategoryPracticeCard from "./CategoryPracticeCard";
import ExamAndCustomCard from "./ExamAndCustomCard";

import ExamPicker from "@/components/exam/ExamPicker";

export type AvailableCategory = {
  name: string;
  count: number;
};

export type ExamPreset = {
  key: string;
  label: string;
  description?: string;
  count: number;
  minutes: number;
};

type Props = {
  availableCategories: AvailableCategory[];
  weakTopics?: string[];
  examPresets?: ExamPreset[];
};

const DEFAULT_EXAM_PRESETS: ExamPreset[] = [
  {
    key: "mini-20",
    label: "Mini Practice Exam",
    description: "A shorter timed set for focused revision.",
    count: 20,
    minutes: 25,
  },
  {
    key: "standard-40",
    label: "Standard Practice Exam",
    description: "Balanced mixed practice across SHSAT math topics.",
    count: 40,
    minutes: 50,
  },
  {
    key: "full-57",
    label: "Full SHSAT Math Exam",
    description: "Full-length timed exam simulation.",
    count: 57,
    minutes: 90,
  },
];

type StartSessionPayload = {
  mode: "diagnostic" | "practice" | "topic" | "exam";
  category?: string;
  examKey?: string;
  count: number;
  minutes: number;
};

export default function PracticeShell({
  availableCategories,
  weakTopics = [],
  examPresets = DEFAULT_EXAM_PRESETS,
}: Props) {
  const router = useRouter();
  const [loadingKey, setLoadingKey] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const startSavedSession = React.useCallback(
    async (payload: StartSessionPayload, key: string) => {
      try {
        setLoadingKey(key);
        setError(null);

        const res = await fetch("/api/sessions/start", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok || !data?.ok || !data?.sessionId) {
          throw new Error(data?.error || "Could not start session");
        }

        router.push(`/session/${data.sessionId}?from=practice`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoadingKey(null);
      }
    },
    [router]
  );

  const startDiagnostic = React.useCallback(() => {
    void startSavedSession(
      {
        mode: "diagnostic",
        count: 12,
        minutes: 20,
      },
      "diagnostic"
    );
  }, [startSavedSession]);

  const startMixedPractice = React.useCallback(() => {
    void startSavedSession(
      {
        mode: "practice",
        count: 10,
        minutes: 12,
      },
      "mixed-practice"
    );
  }, [startSavedSession]);

  const startCategoryPractice = React.useCallback(
    (category: string, count = 10, minutes = 12) => {
      void startSavedSession(
        {
          mode: "topic",
          category,
          count,
          minutes,
        },
        `category-${category}`
      );
    },
    [startSavedSession]
  );

  const startExamPreset = React.useCallback(
    (preset: ExamPreset) => {
      void startSavedSession(
        {
          mode: "exam",
          examKey: preset.key,
          count: preset.count,
          minutes: preset.minutes,
        },
        `exam-${preset.key}`
      );
    },
    [startSavedSession]
  );

  const startCustomPractice = React.useCallback(
    ({
      category,
      count,
      minutes,
    }: {
      category?: string;
      count: number;
      minutes: number;
    }) => {
      const isTopic = !!category && category !== "mixed";

      void startSavedSession(
        {
          mode: isTopic ? "topic" : "practice",
          category: isTopic ? category : undefined,
          count,
          minutes,
        },
        `custom-${category ?? "mixed"}-${count}-${minutes}`
      );
    },
    [startSavedSession]
  );

  const suggestedWeakTopic = weakTopics[0];

  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <PracticeCenterHeader
            title="Practice Center"
            subtitle="Choose how you want to train today — quick drills, category practice, diagnostics, or full exam simulation."
            onStartMixedPractice={startMixedPractice}
            onStartDiagnostic={startDiagnostic}
          />
          <ExamPicker />

          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <CategoryPracticeCard
            categories={availableCategories}
            onStartCategory={startCategoryPractice}
          />
        </div>
      </div>
    </div>
  );
}
