import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import DiagnosticResultsDashboard from "@/components/reports/DiagnosticResultsDashboard";
import PendingSessionResults from "@/app/(appshell)/_components/PendingSessionResults";
import type {
  DiagnosticReport,
  TopicStat,
  TopicSummary,
} from "@/types/diagnostic";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ sessionId: string }>;
};

type TopicStatus = "Strong" | "Good" | "Needs Work" | "Priority";

function toPercent(numerator: number, denominator: number) {
  if (!denominator) return 0;
  return Math.round((numerator / denominator) * 100);
}

function getTopicStatus(accuracy: number): TopicStatus {
  if (accuracy >= 85) return "Strong";
  if (accuracy >= 70) return "Good";
  if (accuracy >= 50) return "Needs Work";
  return "Priority";
}

function getReadinessLevel(
  accuracy: number
): "Foundation" | "Developing" | "Competitive" | "Strong" {
  if (accuracy >= 85) return "Strong";
  if (accuracy >= 70) return "Competitive";
  if (accuracy >= 50) return "Developing";
  return "Foundation";
}

function getRecommendedDailyMinutes(accuracy: number): number {
  if (accuracy >= 85) return 20;
  if (accuracy >= 70) return 30;
  if (accuracy >= 55) return 40;
  return 45;
}

export default async function DiagnosticResultsPage({ params }: PageProps) {
  const { sessionId } = await params;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      mode: true,
      submittedAt: true,
      scoreCorrect: true,
      scoreTotal: true,
      minutes: true,
      attempts: {
        select: {
          questionId: true,
          isCorrect: true,
          flagged: true,
          givenAnswer: true,
          timeSpentSec: true,
          question: {
            select: {
              index: true,
              category: true,
              answer: true,
            },
          },
        },
        orderBy: {
          question: {
            index: "asc",
          },
        },
      },
    },
  });

  if (!session) {
    return (
      <PendingSessionResults
        title="Preparing your diagnostic report"
        message="Your diagnostic results are being finalized. This page will refresh automatically."
      />
    );
  }

  // Keep your real stored mode check
  if (session.mode !== "diagnostic") {
    notFound();
  }

  if (
    !session.submittedAt ||
    session.scoreCorrect == null ||
    session.scoreTotal == null
  ) {
    return (
      <PendingSessionResults
        title="Preparing your diagnostic report"
        message="Your diagnostic results are being finalized. This page will refresh automatically."
      />
    );
  }

  const scoreCorrect = session.scoreCorrect ?? 0;
  const scoreTotal = session.scoreTotal ?? 0;
  const accuracy = toPercent(scoreCorrect, scoreTotal);

  const topicMap = new Map<
    string,
    {
      topic: string;
      correct: number;
      total: number;
      wrong: number;
      unanswered: number;
    }
  >();

  for (const attempt of session.attempts) {
    const topic = attempt.question?.category ?? "Uncategorized";

    if (!topicMap.has(topic)) {
      topicMap.set(topic, {
        topic,
        correct: 0,
        total: 0,
        wrong: 0,
        unanswered: 0,
      });
    }

    const existing = topicMap.get(topic)!;
    existing.total += 1;

    if (attempt.isCorrect === true) {
      existing.correct += 1;
    } else if (attempt.isCorrect === false) {
      existing.wrong += 1;
    } else {
      existing.unanswered += 1;
    }
  }

  const topicStats: TopicStat[] = Array.from(topicMap.values())
    .map((item) => {
      const topicAccuracy = toPercent(item.correct, item.total);

      return {
        topic: item.topic,
        correct: item.correct,
        total: item.total,
        accuracy: topicAccuracy,
        status: getTopicStatus(topicAccuracy),
      };
    })
    .sort((a, b) => {
      if (a.accuracy !== b.accuracy) return a.accuracy - b.accuracy;
      return a.topic.localeCompare(b.topic);
    });

  const weakestTopic: TopicSummary =
    topicStats.length > 0
      ? topicStats[0]
      : {
          topic: "Uncategorized",
          correct: 0,
          total: 0,
          accuracy: 0,
          status: "Priority",
        };

  const strongestTopic: TopicSummary =
    topicStats.length > 0
      ? topicStats[topicStats.length - 1]
      : {
          topic: "Uncategorized",
          correct: 0,
          total: 0,
          accuracy: 0,
          status: "Needs Work",
        };

  const weakTopics = topicStats
    .filter(
      (topic) => topic.status === "Priority" || topic.status === "Needs Work"
    )
    .map((topic) => topic.topic)
    .slice(0, 3);

  const fallbackWeakTopics =
    weakTopics.length > 0
      ? weakTopics
      : topicStats.slice(0, 2).map((topic) => topic.topic);

  const totalTimeSec = session.attempts.reduce(
    (sum, attempt) => sum + (attempt.timeSpentSec ?? 0),
    0
  );

  const totalTimeMin =
    totalTimeSec > 0
      ? Math.max(1, Math.round(totalTimeSec / 60))
      : session.minutes ?? 0;

  const readinessLevel = getReadinessLevel(accuracy);
  const recommendedDailyMinutes = getRecommendedDailyMinutes(accuracy);

  const summary =
    fallbackWeakTopics.length > 0 && strongestTopic.topic
      ? `You showed the strongest performance in ${
          strongestTopic.topic
        }, while ${fallbackWeakTopics.join(
          ", "
        )} need the most attention next. This diagnostic is a starting point, and with structured daily practice you can improve both accuracy and confidence.`
      : strongestTopic.topic
      ? `You showed the strongest performance in ${strongestTopic.topic}. This diagnostic is a starting point, and the next step is to build consistent accuracy across all topics.`
      : `This diagnostic is a starting point, not a final judgment. We’ll use it to build a focused study plan around your current performance.`;

  const report: DiagnosticReport = {
    sessionId: session.id,
    scoreCorrect,
    scoreTotal,
    accuracy,
    totalTimeMin,
    readinessLevel,
    strongestTopic,
    weakestTopic,
    topicStats,
    weakTopics: fallbackWeakTopics,
    recommendedDailyMinutes,
    summary,
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
      "Consistency beats intensity — daily focused practice leads to steady improvement.",
      "Review why an answer was wrong, not just what the correct answer was.",
      "Weak topics can become strengths with deliberate repetition.",
      "Timed practice helps you build stamina and better pacing.",
      "Track small improvements each week and let them compound.",
    ],
  };

  return <DiagnosticResultsDashboard report={report} />;
}
