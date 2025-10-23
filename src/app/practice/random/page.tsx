// app/practice/random/page.tsx
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { pickRandom57Ids } from "@/lib/selectors/pickRandom57";

function toInt(v: string | string[] | undefined, d: number) {
  if (!v) return d;
  const n = Number(Array.isArray(v) ? v[0] : v);
  return Number.isFinite(n) ? n : d;
}

export default async function PracticeRandomPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const minutes = toInt(sp.minutes, 90);
  const count = Math.max(1, toInt(sp.count, 57));

  // Map Clerk user → local DB user (or guest)
  const { userId: clerkUserId } = await auth();
  const dbUserId = clerkUserId
    ? (
        await prisma.user.findUnique({
          where: { externalAuthId: clerkUserId },
          select: { id: true },
        })
      )?.id ?? null
    : null;

  // Pull a pool of IDs and slice
  const pool = await pickRandom57Ids(); // your function already randomizes
  const questionIds = pool.slice(0, Math.min(count, pool.length));

  if (!questionIds.length) {
    redirect("/practice"); // fallback
  }

  const session = await prisma.session.create({
    data: {
      userId: dbUserId,
      examKey: "random",
      label: "SHSAT Practice",
      mode: "full",
      minutes,
      scoreTotal: questionIds.length,
      questionIds,
    },
  });

  redirect(`/exam/${session.id}`);
}
