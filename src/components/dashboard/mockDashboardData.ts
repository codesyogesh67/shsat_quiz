import type { DashboardData } from "./types";

export const mockServerData = {
  attempts: [
    { id: "1", category: "Algebra", isCorrect: true },
    { id: "2", category: "Algebra", isCorrect: true },
    { id: "3", category: "Algebra", isCorrect: false },

    { id: "4", category: "Geometry", isCorrect: false },
    { id: "5", category: "Geometry", isCorrect: false },
    { id: "6", category: "Geometry", isCorrect: true },

    { id: "7", category: "Arithmetic", isCorrect: true },
    { id: "8", category: "Arithmetic", isCorrect: false },
    { id: "9", category: "Arithmetic", isCorrect: true },

    { id: "10", category: "Statistics", isCorrect: true },
    { id: "11", category: "Statistics", isCorrect: false },
  ],

  sessions: [
    {
      id: "exam1",
      mode: "FULL_EXAM",
      label: "Practice Exam 1",
      scoreRaw: 42,
      accuracy: 0.74,
      minutesSpent: 160,
      flaggedCount: 4,
      createdAt: new Date("2025-03-05"),
    },
    {
      id: "exam2",
      mode: "FULL_EXAM",
      label: "Practice Exam 2",
      scoreRaw: 36,
      accuracy: 0.63,
      minutesSpent: 150,
      flaggedCount: 6,
      createdAt: new Date("2025-03-07"),
    },
    {
      id: "exam3",
      mode: "TIMED",
      label: "Geometry Drill",
      scoreRaw: 20,
      accuracy: 0.57,
      minutesSpent: 45,
      flaggedCount: 2,
      createdAt: new Date("2025-03-09"),
    },
  ],
};
