// app/(onboarding)/diagnostic/actions.ts
"use server";

import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

const CATEGORIES = [
  "Algebra",
  "Arithmetic",
  "Geometry",
  "Probability and Statistics",
  "Practice_set_1",
] as const;

const FULL_COUNT = 57;
const QUICK_COUNT = 20; // >= 30 minutes at SHSAT pace

const SECONDS_PER_Q = 5400 / 57; // 90 min / 57Q

function minutesForCount(count: number) {
  const seconds = Math.round(count * SECONDS_PER_Q);
  const mins = Math.ceil(seconds / 60);
  return Math.max(30, mins); // enforce at least 30 minutes for quick
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function pickBalancedQuestionIds(totalCount: number) {
  const perCat = Math.floor(totalCount / CATEGORIES.length);
  let remainder = totalCount - perCat * CATEGORIES.length;

  const picked: string[] = [];

  for (const cat of CATEGORIES) {
    const take = perCat + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder--;

    // Pull a pool then shuffle for variety (Prisma random order isn't portable)
    const pool = await prisma.question.findMany({
      where: { category: cat },
      select: { id: true },
      take: Math.max(80, take * 8),
    });

    const ids = shuffle(pool.map((p) => p.id)).slice(0, take);
    picked.push(...ids);
  }

  // Final shuffle mixes categories so it doesn’t feel “blocked”
  return shuffle(picked);
}

export async function startDiagnostic(formData: FormData) {
  const variant = String(formData.get("variant") ?? "quick");
  const count = variant === "full" ? FULL_COUNT : QUICK_COUNT;
  const minutes = variant === "full" ? 90 : minutesForCount(count);

  const questionIds = await pickBalancedQuestionIds(count);

  if (!questionIds.length) {
    // If DB has no questions in those categories, fail loudly
    throw new Error("No questions found for diagnostic categories.");
  }

  const session = await prisma.session.create({
    data: {
      mode: "DIAGNOSTIC",
      minutes,
      questionIds,
      label: variant === "full" ? "Diagnostic (Full)" : "Diagnostic (Quick)",
    },
    select: { id: true },
  });

  redirect(`/exam/${session.id}?mode=diagnostic`);
}
