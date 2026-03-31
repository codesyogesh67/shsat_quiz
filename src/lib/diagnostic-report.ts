import prisma from "@/lib/prisma";

type TopicStat = {
  topic: string;
  total: number;
  correct: number;
  accuracy: number;
  status: "Strong" | "Good" | "Needs Work" | "Priority";
};

type StudyPlanDay = {
  day: string;
  title: string;
  minutes: number;
};

export type DiagnosticReport = {
  sessionId: string;
  scoreCorrect: number;
  scoreTotal: number;
  accuracy: number;
  totalTimeMin: number;
  readinessLevel: "Foundation" | "Developing" | "Competitive" | "Strong";
  strongestTopic: TopicStat | null;
  weakestTopic: TopicStat | null;
  topicStats: TopicStat[];
  weakTopics: string[];
  recommendedDailyMinutes: string;
  summary: string;
};

function getTopicStatus(accuracy: number): TopicStat["status"] {
  if (accuracy >= 80) return "Strong";
  if (accuracy >= 60) return "Good";
  if (accuracy >= 40) return "Needs Work";
  return "Priority";
}

function getReadinessLevel(
  accuracy: number
): DiagnosticReport["readinessLevel"] {
  if (accuracy >= 80) return "Strong";
  if (accuracy >= 65) return "Competitive";
  if (accuracy >= 45) return "Developing";
  return "Foundation";
}

function getRecommendedDailyMinutes(accuracy: number): string {
  if (accuracy < 45) return "30–40 min/day";
  if (accuracy < 65) return "25–30 min/day";
  return "20–25 min/day";
}

function buildWeeklyPlan(
  weakTopics: string[],
  accuracy: number
): StudyPlanDay[] {
  const first = weakTopics[0] || "Weak Topic Practice";
  const second = weakTopics[1] || first || "Mixed Practice";

  const timedMinutes = accuracy < 45 ? 35 : accuracy < 65 ? 30 : 25;

  return [
    { day: "Day 1", title: `${first} Practice`, minutes: 25 },
    { day: "Day 2", title: `${second} Practice`, minutes: 25 },
    { day: "Day 3", title: "Mixed Review", minutes: 20 },
    { day: "Day 4", title: `${first} Practice`, minutes: 30 },
    { day: "Day 5", title: "Review Mistakes", minutes: 20 },
    { day: "Day 6", title: "Timed Mini Drill", minutes: timedMinutes },
    { day: "Day 7", title: "Light Review / Rest", minutes: 15 },
  ];
}

export async function getDiagnosticReport(
  sessionId: string
): Promise<DiagnosticReport | null> {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      attempts: {
        include: {
          question: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!session) return null;

  const total = session.scoreTotal || session.attempts.length;
  const correct =
    session.scoreCorrect ||
    session.attempts.filter((a) => a.isCorrect === true).length;

  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  const totalTimeSec = session.attempts.reduce(
    (sum, attempt) => sum + (attempt.timeSpentSec || 0),
    0
  );

  const topicMap = new Map<string, { total: number; correct: number }>();

  for (const attempt of session.attempts) {
    const topic = attempt.question.category?.trim() || "Unknown";
    const prev = topicMap.get(topic) ?? { total: 0, correct: 0 };

    prev.total += 1;
    if (attempt.isCorrect) prev.correct += 1;

    topicMap.set(topic, prev);
  }

  const topicStats: TopicStat[] = Array.from(topicMap.entries())
    .map(([topic, stat]) => {
      const topicAccuracy =
        stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;

      return {
        topic,
        total: stat.total,
        correct: stat.correct,
        accuracy: topicAccuracy,
        status: getTopicStatus(topicAccuracy),
      };
    })
    .sort((a, b) => a.accuracy - b.accuracy);

  const weakTopics = topicStats
    .filter((t) => t.accuracy < 60)
    .map((t) => t.topic)
    .slice(0, 3);

  const weakestTopic = topicStats[0] ?? null;
  const strongestTopic =
    [...topicStats].sort((a, b) => b.accuracy - a.accuracy)[0] ?? null;

  const readinessLevel = getReadinessLevel(accuracy);
  const recommendedDailyMinutes = getRecommendedDailyMinutes(accuracy);

  const strongestText = strongestTopic
    ? strongestTopic.topic
    : "your stronger topics";
  const weakText =
    weakTopics.length > 0 ? weakTopics.join(" and ") : "a few target areas";

  const summary =
    accuracy >= 70
      ? `You have a solid starting base. Your strongest area is ${strongestText}, and your next step is to keep strengthening ${weakText} with consistent practice.`
      : accuracy >= 45
      ? `You are building a good foundation. You showed the most strength in ${strongestText}, but ${weakText} need more attention in the coming week.`
      : `This diagnostic shows where to focus first. Your biggest opportunity for improvement is in ${weakText}, and steady daily practice can raise your performance quickly.`;

  const mindset = [
    "Focus on understanding mistakes, not just finishing questions.",
    "Practice weak topics consistently before worrying too much about speed.",
    "Small daily sessions work better than long, exhausting cramming sessions.",
    "This diagnostic is a starting point, not your final potential.",
  ];

  const weeklyPlan = buildWeeklyPlan(weakTopics, accuracy);

  return {
    sessionId: session.id,
    scoreCorrect: correct,
    scoreTotal: total,
    accuracy,
    totalTimeMin: Math.ceil(totalTimeSec / 60),
    readinessLevel,
    strongestTopic,
    weakestTopic,
    topicStats,
    weakTopics,
    recommendedDailyMinutes,
    summary,
  };
}
