// src/lib/utils/pickRandom57.ts
import prisma from "@/lib/prisma";

export async function pickRandom57Ids() {
  const all = await prisma.question.findMany({ select: { id: true } });
  return all
    .sort(() => Math.random() - 0.5)
    .slice(0, 57)
    .map((q) => q.id);
}
