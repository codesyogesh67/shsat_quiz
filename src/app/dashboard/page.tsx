// app/dashboard/page.tsx
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import DashboardPageClient from "@/components/dashboard/DashboardPageClient";

export type ServerSessionRow = {
  id: string;
  examKey: string | null;
  startedAt: Date;
  submittedAt: Date | null;
  scoreCorrect: number;
  scoreTotal: number;
  minutes: number | null;
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
  user?: { name?: string | null; imageUrl?: string | null };
  sessions: ServerSessionRow[];
  attempts: ServerAttemptRow[];
};

export default async function DashboardPage() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-bold mb-3">Dashboard</h1>
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
    select: { id: true, name: true, imageUrl: true },
  });

  if (!dbUser) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-bold mb-3">Dashboard</h1>
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

  // Recent sessions
  const sessions = await prisma.session.findMany({
    where: { userId: dbUser.id },
    orderBy: { startedAt: "desc" },
    take: 10,
    select: {
      id: true,
      examKey: true,
      startedAt: true,
      submittedAt: true,
      scoreCorrect: true,
      scoreTotal: true,
      minutes: true,
    },
  });

  // Attempts (for totals + categories)
  const attempts = await prisma.attempt.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: "desc" },
    take: 2000,
    select: {
      sessionId: true,
      isCorrect: true,
      flagged: true,
      timeSpentSec: true,
      createdAt: true,
      question: { select: { category: true } },
    },
  });

  const serverData: DashboardServerData = {
    user: { name: dbUser.name, imageUrl: dbUser.imageUrl },
    sessions: sessions.map((s) => ({
      id: s.id,
      examKey: s.examKey,
      startedAt: s.startedAt,
      submittedAt: s.submittedAt,
      scoreCorrect: s.scoreCorrect ?? 0,
      scoreTotal: s.scoreTotal ?? 0,
      minutes: s.minutes ?? 0,
    })),
    attempts: attempts.map((a) => ({
      sessionId: a.sessionId,
      isCorrect: a.isCorrect,
      flagged: a.flagged,
      timeSpentSec: a.timeSpentSec ?? 0,
      createdAt: a.createdAt,
      category: a.question?.category ?? null,
    })),
  };

  return <DashboardPageClient serverData={serverData} />;
}
