import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import DashboardPageClient from "@/components/dashboard/DashboardPageClient";
import { getCurrentUserAccess } from "@/lib/get-current-user-access";
import DashboardLockedState from "@/components/dashboard/DashboardLockedState";

export type ServerSessionRow = {
  id: string;
  label: string | null;
  examKey: string | null;
  startedAt: Date;
  submittedAt: Date | null;
  scoreCorrect: number;
  scoreTotal: number;
  minutes: number;
};

export type ServerAttemptRow = {
  sessionId: string;
  isCorrect: boolean | null;
  flagged: boolean;
  timeSpentSec: number;
  createdAt: Date;
  category: string | null;
};

export type DashboardServerData = {
  user?: {
    name?: string | null;
    imageUrl?: string | null;
  };
  sessions: ServerSessionRow[];
  attempts: ServerAttemptRow[];
};

export default async function DashboardPage() {
  const access = await getCurrentUserAccess();

  if (!access.canUseDashboard) {
    return <DashboardLockedState access={access} />;
  }

  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="mb-3 text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Please{" "}
          <Link href="/sign-in" className="underline">
            sign in
          </Link>{" "}
          to view your progress and recent exams.
        </p>
      </div>
    );
  }

  const dbUser = await prisma.user.findUnique({
    where: { externalAuthId: clerkUserId },
    select: {
      id: true,
      name: true,
      imageUrl: true,
    },
  });

  if (!dbUser) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="mb-3 text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          We’re setting up your account… try again in a moment, or start a{" "}
          <Link href="/practice" className="underline">
            practice exam
          </Link>
          .
        </p>
      </div>
    );
  }

  const sessionsResult = await prisma.session.findMany({
    where: { userId: dbUser.id },
    orderBy: { startedAt: "desc" },
    take: 10,
    select: {
      id: true,
      label: true,
      examKey: true,
      startedAt: true,
      submittedAt: true,
      scoreCorrect: true,
      scoreTotal: true,
      minutes: true,
    },
  });

  let attemptsResult: {
    sessionId: string;
    isCorrect: boolean | null;
    flagged: boolean;
    timeSpentSec: number | null;
    createdAt: Date;
    question: {
      category: string | null;
    } | null;
  }[] = [];

  try {
    attemptsResult = await prisma.attempt.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: "desc" },
      take: 500,
      select: {
        sessionId: true,
        isCorrect: true,
        flagged: true,
        timeSpentSec: true,
        createdAt: true,
        question: {
          select: {
            category: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Dashboard attempts query failed:", error);
    attemptsResult = [];
  }

  const sessions: ServerSessionRow[] = sessionsResult.map((s) => ({
    id: s.id,
    label: s.label,
    examKey: s.examKey ?? null,
    startedAt: s.startedAt,
    submittedAt: s.submittedAt,
    scoreCorrect: s.scoreCorrect ?? 0,
    scoreTotal: s.scoreTotal ?? 0,
    minutes: s.minutes ?? 0,
  }));

  const attempts: ServerAttemptRow[] = attemptsResult.map((a) => ({
    sessionId: a.sessionId,
    isCorrect: a.isCorrect,
    flagged: a.flagged,
    timeSpentSec: a.timeSpentSec ?? 0,
    createdAt: a.createdAt,
    category: a.question?.category ?? null,
  }));

  const serverData: DashboardServerData = {
    user: {
      name: dbUser.name,
      imageUrl: dbUser.imageUrl,
    },
    sessions,
    attempts,
  };

  return <DashboardPageClient serverData={serverData} />;
}
