import type { DashboardData } from "@/components/dashboard/types";

type CategoryStat = DashboardData["categoryStats"][number];

export type GeneratedPlanStep = {
  id: string;
  label: string;
  description: string;
  questions: number;
  minutes: number;
  badge: string;
  accentClass: string;
  categoryKey: string;
};

export type GeneratedStudyPlan = {
  weakestCategory: CategoryStat | null;
  steps: GeneratedPlanStep[];
};

function getWeakestCategory(categories: CategoryStat[]) {
  const valid = categories.filter((item) => item.attempted > 0);

  if (!valid.length) return null;

  return [...valid].sort((a, b) => {
    if (a.accuracy !== b.accuracy) return a.accuracy - b.accuracy;
    return b.attempted - a.attempted;
  })[0];
}

export function generateStudyPlan(
  categories: CategoryStat[]
): GeneratedStudyPlan {
  const weakestCategory = getWeakestCategory(categories);
  const weakCategory = weakestCategory?.category ?? "mixed";

  const steps: GeneratedPlanStep[] = [
    {
      id: "weak-reset",
      label:
        weakCategory === "mixed"
          ? "Starter Reset Drill"
          : `${weakCategory} Reset Drill`,
      description:
        "Start small. Rebuild confidence with a short, low-pressure session.",
      questions: 10,
      minutes: 12,
      badge: "Step 1",
      accentClass:
        "from-indigo-50 to-violet-50 border-indigo-200 hover:border-indigo-300",
      categoryKey: weakCategory,
    },
    {
      id: "weak-accuracy",
      label:
        weakCategory === "mixed"
          ? "Accuracy Builder"
          : `${weakCategory} Accuracy Builder`,
      description:
        "Slow down and focus on clean solving. The goal is accuracy, not speed.",
      questions: 12,
      minutes: 15,
      badge: "Step 2",
      accentClass:
        "from-emerald-50 to-cyan-50 border-emerald-200 hover:border-emerald-300",
      categoryKey: weakCategory,
    },
    {
      id: "mixed-light",
      label: "Light Mixed Review",
      description:
        "Mix your focus area with other topics so the skill does not stay isolated.",
      questions: 15,
      minutes: 18,
      badge: "Step 3",
      accentClass: "from-sky-50 to-blue-50 border-sky-200 hover:border-sky-300",
      categoryKey: "mixed",
    },
    {
      id: "weak-speed",
      label:
        weakCategory === "mixed"
          ? "Speed Practice"
          : `${weakCategory} Speed Practice`,
      description:
        "Practice the same focus area again, but now with slightly tighter timing.",
      questions: 15,
      minutes: 20,
      badge: "Step 4",
      accentClass:
        "from-amber-50 to-rose-50 border-amber-200 hover:border-orange-300",
      categoryKey: weakCategory,
    },
    {
      id: "mixed-reinforcement",
      label: "Mixed Reinforcement",
      description:
        "Rebuild flexibility by solving different topics in one short session.",
      questions: 20,
      minutes: 25,
      badge: "Step 5",
      accentClass:
        "from-violet-50 to-fuchsia-50 border-violet-200 hover:border-violet-300",
      categoryKey: "mixed",
    },
    {
      id: "weak-mastery",
      label:
        weakCategory === "mixed"
          ? "Mastery Check"
          : `${weakCategory} Mastery Check`,
      description:
        "Check whether your focus area is improving after repeated practice.",
      questions: 20,
      minutes: 25,
      badge: "Step 6",
      accentClass:
        "from-indigo-50 to-blue-50 border-indigo-200 hover:border-indigo-300",
      categoryKey: weakCategory,
    },
    {
      id: "mixed-pressure",
      label: "Timed Mixed Practice",
      description:
        "Add moderate time pressure while keeping the session manageable.",
      questions: 25,
      minutes: 32,
      badge: "Step 7",
      accentClass:
        "from-cyan-50 to-sky-50 border-cyan-200 hover:border-cyan-300",
      categoryKey: "mixed",
    },
    {
      id: "exam-readiness",
      label: "Exam Readiness Set",
      description:
        "Move closer to test conditions with a longer mixed practice block.",
      questions: 30,
      minutes: 40,
      badge: "Step 8",
      accentClass:
        "from-slate-50 to-indigo-50 border-slate-200 hover:border-indigo-300",
      categoryKey: "mixed",
    },
    {
      id: "near-full",
      label: "Near Full-Length Practice",
      description:
        "Build stamina before attempting a complete SHSAT math simulation.",
      questions: 40,
      minutes: 55,
      badge: "Step 9",
      accentClass:
        "from-purple-50 to-violet-50 border-purple-200 hover:border-purple-300",
      categoryKey: "mixed",
    },
    {
      id: "full-shsat",
      label: "Full SHSAT Math Simulation",
      description:
        "Finish the plan with a full 57-question timed exam simulation.",
      questions: 57,
      minutes: 90,
      badge: "Step 10",
      accentClass:
        "from-amber-50 to-rose-50 border-amber-200 hover:border-orange-300",
      categoryKey: "mixed",
    },
  ];

  return {
    weakestCategory,
    steps,
  };
}
