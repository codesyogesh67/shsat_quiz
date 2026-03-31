export type ReadinessLevel =
  | "Foundation"
  | "Developing"
  | "Competitive"
  | "Strong";

export type TopicStatus = "Strong" | "Good" | "Needs Work" | "Priority";

export type TopicSummary = {
  topic: string;
  correct: number;
  total: number;
  accuracy?: number;
  status?: TopicStatus;
};

export type TopicStat = {
  topic: string;
  correct: number;
  total: number;
  accuracy: number;
  status: TopicStatus;
};

export type WeeklyPlanItem = {
  day: string;
  title: string;
  minutes: number;
};

export type DiagnosticReport = {
  sessionId: string;
  accuracy: number;
  scoreCorrect: number;
  scoreTotal: number;
  readinessLevel: ReadinessLevel;
  totalTimeMin: number;
  recommendedDailyMinutes: number;
  summary: string;
  weakTopics: string[];
  strongestTopic: TopicSummary;
  weakestTopic: TopicSummary;
  topicStats: TopicStat[];
  weeklyPlan: WeeklyPlanItem[];
  mindset: string[];
};

export type ReportComponentProps = {
  report: DiagnosticReport;
};
