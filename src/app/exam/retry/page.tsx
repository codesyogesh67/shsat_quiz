// app/exam/retry/page.tsx
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";

type Search = {
  from?: string;
  scope?: "all" | "wrong" | "flagged";
};

function orderByFrozen<T extends { questionId: string }>(
  ids: string[],
  rows: T[]
) {
  const pos = new Map(ids.map((id, i) => [id, i]));
  return [...rows].sort(
    (a, b) => pos.get(a.questionId)! - pos.get(b.questionId)!
  );
}

export default async function RetryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const from = (sp.from as string) || "";
  const scope = ((sp.scope as string) || "all") as Search["scope"];

  if (!from) {
    // No source session → send to picker
    redirect("/exam");
  }

  // Load the source session + its attempts
  const session = await prisma.session.findUnique({
    where: { id: from },
    select: {
      id: true,
      userId: true,
      examKey: true,
      label: true,
      minutes: true,
      questionIds: true,
      submittedAt: true,
    },
  });

  if (!session) {
    redirect("/exam"); // or a 404 page if you prefer
  }

  const attempts = await prisma.attempt.findMany({
    where: { sessionId: session.id },
    select: {
      questionId: true,
      isCorrect: true,
      flagged: true,
    },
  });

  // Decide which questions to include
  let selectedIds: string[] = session.questionIds;
  if (scope === "wrong") {
    const wrongSet = new Set(
      attempts.filter((a) => a.isCorrect === false).map((a) => a.questionId)
    );
    selectedIds = session.questionIds.filter((id) => wrongSet.has(id));
  } else if (scope === "flagged") {
    const flaggedSet = new Set(
      attempts.filter((a) => a.flagged).map((a) => a.questionId)
    );
    selectedIds = session.questionIds.filter((id) => flaggedSet.has(id));
  }

  // Fallback if filter emptied the list
  if (!selectedIds.length) {
    selectedIds = session.questionIds;
  }

  // Ensure the user is mapped properly (Clerk → local user)
  const { userId: clerkUserId } = await auth();
  const dbUserId = clerkUserId
    ? (
        await prisma.user.findUnique({
          where: { externalAuthId: clerkUserId },
          select: { id: true },
        })
      )?.id ?? null
    : null;

  // Create the new session (fresh attempt)
  const newSession = await prisma.session.create({
    data: {
      userId: dbUserId, // null for guest is fine
      examKey: session.examKey,
      label:
        scope === "all"
          ? `Retake of ${session.label ?? session.examKey ?? "exam"}`
          : `Retake (${scope}) of ${
              session.label ?? session.examKey ?? "exam"
            }`,
      mode: "full",
      minutes: session.minutes ?? 90,
      scoreTotal: selectedIds.length,
      questionIds: selectedIds,
    },
    select: { id: true },
  });

  redirect(`/exam/${newSession.id}`);
}
