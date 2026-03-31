import { DiagnosticReport } from "@/types/diagnostic";

export const mockReport: DiagnosticReport = {
  sessionId: "diag-2026-03-10-001",
  summary:
    "You scored above average on this diagnostic, showing strong algebraic reasoning and solid reading comprehension. Your geometry and data interpretation skills need focused practice to reach a competitive level. With consistent daily work, you can improve significantly before test day.",
  readinessLevel: "Competitive",
  scoreCorrect: 42,
  scoreTotal: 57,
  accuracy: 73.7,
  totalTimeMin: 84,
  recommendedDailyMinutes: 45,
  weakTopics: ["Geometry", "Data Interpretation", "Revising/Editing"],

  strongestTopic: {
    topic: "Algebra",
    correct: 10,
    total: 11,
    accuracy: 91,
    status: "Strong",
  },

  weakestTopic: {
    topic: "Geometry",
    correct: 5,
    total: 10,
    accuracy: 48,
    status: "Priority",
  },

  topicStats: [
    {
      topic: "Algebra",
      correct: 10,
      total: 11,
      accuracy: 91,
      status: "Strong",
    },
    {
      topic: "Arithmetic",
      correct: 7,
      total: 9,
      accuracy: 78,
      status: "Good",
    },
    {
      topic: "Geometry",
      correct: 5,
      total: 10,
      accuracy: 48,
      status: "Priority",
    },
    {
      topic: "Data Interpretation",
      correct: 4,
      total: 8,
      accuracy: 50,
      status: "Priority",
    },
    {
      topic: "Reading Comprehension",
      correct: 9,
      total: 11,
      accuracy: 82,
      status: "Good",
    },
    {
      topic: "Revising/Editing",
      correct: 4,
      total: 5,
      accuracy: 80,
      status: "Needs Work",
    },
    {
      topic: "Word Problems",
      correct: 3,
      total: 3,
      accuracy: 100,
      status: "Strong",
    },
  ],

  weeklyPlan: [
    { day: "Monday", title: "Geometry Foundations", minutes: 50 },
    { day: "Tuesday", title: "Data Interpretation Drills", minutes: 45 },
    { day: "Wednesday", title: "Revising & Editing Practice", minutes: 40 },
    { day: "Thursday", title: "Mixed Math Review", minutes: 50 },
    { day: "Friday", title: "Reading Comprehension Passages", minutes: 45 },
    { day: "Saturday", title: "Full Practice Set", minutes: 60 },
    { day: "Sunday", title: "Review & Light Practice", minutes: 30 },
  ],

  mindset: [
    "Consistency beats intensity — 45 minutes daily is more effective than weekend cramming.",
    "Focus on understanding why you got a question wrong, not just the correct answer.",
    "Track your progress weekly. Small gains compound into big results.",
    "Take timed practice sets to build test-day stamina and pacing.",
    "Believe in the process. Every student who commits to deliberate practice improves.",
  ],
};
