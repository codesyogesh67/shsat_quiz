export type CategoryKey =
  | "Algebra"
  | "Arithmetic"
  | "Geometry"
  | "Statistics & Probability";

export type CategoryStat = {
  category: CategoryKey | string;
  attempted: number;
  correct: number;
  accuracy: number; // 0..1
};

export type ExamResult = {
  id: string;
  dateISO: string; // YYYY-MM-DD
  mode: "Full 57" | "By Category" | "Custom";
  label?: string; // e.g. shsat_2019_A
  minutesSpent: number;
  scoreRaw: number; // out of 57
  accuracy: number; // 0..1
  wrongCount: number;
  flaggedCount: number;
};

export type ActivityItem = {
  id: string;
  type: "exam" | "practice" | "goal";
  title: string;
  dateISO: string;
  meta?: string;
};

export type DashboardData = {
  totals: {
    questionsAnswered: number;
    accuracy: number; // 0..1
    minutes: number;
    streakDays: number;
  };
  categoryStats: CategoryStat[];
  recentExams: ExamResult[];
  activity: ActivityItem[];
};
