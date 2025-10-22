// app/practice/page.tsx
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import PracticeShell from "@/components/practice/PracticeShell";
import { pickRandom57Ids } from "@/lib/selectors/pickRandom57";

function toInt(v: string | string[] | undefined, d: number) {
  if (!v) return d;
  const n = Number(Array.isArray(v) ? v[0] : v);
  return Number.isFinite(n) ? n : d;
}

export default async function PracticePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  // Legacy/practice params you already support
  const mode = (sp.mode as string) ?? "diagnostic";
  const count = toInt(sp.count, 20);

  // NEW: exam-style params that should go to /exam/[sessionId]
  const examKey = typeof sp.exam === "string" ? sp.exam : undefined; // e.g. "shsat_2018" or "random"
  const preset = typeof sp.preset === "string" ? sp.preset : undefined; // e.g. "shsat57"
  const minutes = toInt(sp.minutes, 90);
  const customCount =
    typeof sp.count === "string" ? toInt(sp.count, 57) : undefined;
  const category = typeof sp.category === "string" ? sp.category : undefined;
  const randomize =
    typeof sp.randomize === "string" ? sp.randomize !== "false" : true;

  // If the URL is targeting an "exam flow", create a Session and redirect.
  if (examKey || preset === "shsat57" || customCount) {
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

    let questionIds: string[] = [];

    if (examKey) {
      if (examKey === "random") {
        // Random pool; if you want category-aware random, add a custom picker
        const ids = await pickRandom57Ids();
        const n = Math.max(1, Math.min(customCount ?? 57, ids.length));
        questionIds = ids.slice(0, n);
      } else {
        // Fixed past paper (e.g., "shsat_2018")
        const qs = await prisma.question.findMany({
          where: { examKey },
          select: { id: true, index: true },
          orderBy: { index: "asc" },
        });
        const n = Math.max(1, Math.min(customCount ?? qs.length, qs.length));
        questionIds = qs.slice(0, n).map((q) => q.id);
      }
    } else if (preset === "shsat57") {
      // Your legacy “57 questions / 90 min” preset
      const ids = await pickRandom57Ids();
      questionIds = ids.slice(0, 57);
    } else if (customCount) {
      // Custom random practice from your pool; category/randomize kept for parity (basic version)
      if (category && category !== "all") {
        const qs = await prisma.question.findMany({
          where: { category },
          select: { id: true },
        });
        const pool = qs.map((q) => q.id);
        if (randomize) pool.sort(() => Math.random() - 0.5);
        questionIds = pool.slice(
          0,
          Math.max(1, Math.min(customCount, pool.length))
        );
      } else {
        const all = await prisma.question.findMany({ select: { id: true } });
        const pool = all.map((q) => q.id);
        if (randomize) pool.sort(() => Math.random() - 0.5);
        questionIds = pool.slice(
          0,
          Math.max(1, Math.min(customCount, pool.length))
        );
      }
    }

    if (!questionIds.length) {
      // Nothing to serve; fall back to PracticeShell
    } else {
      const session = await prisma.session.create({
        data: {
          userId: dbUserId, // FK to your internal User.id or null for guest
          examKey: examKey ?? (preset === "shsat57" ? "random-57" : "custom"),
          label: "SHSAT Practice",
          mode: "full",
          minutes,
          scoreTotal: questionIds.length,
          questionIds,
        },
      });

      redirect(`/exam/${session.id}`);
    }
  }

  // If no exam params, keep your existing PracticeShell page
  return (
    <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 md:px-10 lg:px-20 xl:px-28 py-6">
      <PracticeShell
        initialMode={mode}
        initialCount={count}
        initialData={null}
      />
    </div>
  );
}
