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
  mode: string;
  startedAt: Date;
  submittedAt: Date | null;
  scoreCorrect: number;
  scoreTotal: number;
  minutes: number;
  flagsCount: number;
  progressCount: number;
  categoryBreakdown: unknown | null;
  timeSpentSec: number;
};

export type DashboardServerData = {
  user?: {
    name?: string | null;
    imageUrl?: string | null;
    planType?: "FREE" | "TRIAL" | "PREMIUM";
    subscriptionStatus?: string | null;
    trialEndsAt?: Date | null;
    premiumStartedAt?: Date | null;
    premiumEndsAt?: Date | null;
  };
  sessions: ServerSessionRow[];
  completedPlanSessions: number;
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
      planType: true,
      subscriptionStatus: true,
      trialEndsAt: true,
      premiumStartedAt: true,
      premiumEndsAt: true,
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
    where: {
      userId: dbUser.id,
      submittedAt: {
        not: null,
      },
    },
    orderBy: {
      submittedAt: "desc",
    },
    take: 50,
    select: {
      id: true,
      label: true,
      examKey: true,
      mode: true,
      startedAt: true,
      submittedAt: true,
      scoreCorrect: true,
      scoreTotal: true,
      minutes: true,
      flagsCount: true,
      progressCount: true,
      categoryBreakdown: true,
      attempts: {
        select: {
          timeSpentSec: true,
        },
      },
    },
  });

  const sessions: ServerSessionRow[] = sessionsResult.map((s) => {
    const timeSpentSec = s.attempts.reduce((total, attempt) => {
      return total + (attempt.timeSpentSec ?? 0);
    }, 0);

    return {
      id: s.id,
      label: s.label,
      examKey: s.examKey ?? null,
      mode: s.mode,
      startedAt: s.startedAt,
      submittedAt: s.submittedAt,
      scoreCorrect: s.scoreCorrect ?? 0,
      scoreTotal: s.scoreTotal ?? 0,
      minutes: Math.ceil(timeSpentSec / 60),
      flagsCount: s.flagsCount ?? 0,
      progressCount: s.progressCount ?? 0,
      categoryBreakdown: s.categoryBreakdown ?? null,
      timeSpentSec,
    };
  });

  const completedPlanSessions = sessions.filter((session) => {
    return (
      session.submittedAt &&
      ["PRACTICE", "practice", "topic", "CATEGORY", "category"].includes(
        session.mode
      )
    );
  }).length;

  const serverData: DashboardServerData = {
    user: {
      name: dbUser.name,
      imageUrl: dbUser.imageUrl,
      planType: dbUser.planType,
      subscriptionStatus: dbUser.subscriptionStatus,
      trialEndsAt: dbUser.trialEndsAt,
      premiumStartedAt: dbUser.premiumStartedAt,
      premiumEndsAt: dbUser.premiumEndsAt,
    },
    sessions,
    completedPlanSessions,
  };

  return <DashboardPageClient serverData={serverData} />;
}
