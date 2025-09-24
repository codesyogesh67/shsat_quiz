// src/lib/database/loadFromDb.server.ts
import "server-only";
import prisma from "@/lib/prisma"; // your prisma singleton
import type { Question as AppQuestion } from "@/types";
import { whereByExamKey } from "@/lib/database/doWhere";
import {
  normalizeQuestionType,
  coerceMedia,
  coerceChoices,
} from "@/lib/helpers";

/** Map a Prisma row to your app's Question shape */
function toAppQuestion(row: {
  id: string;
  index: number;
  type: string;
  stem: string;
  answer: string | null;
  category: string | null;
  choices: unknown | null;
  media: unknown | null;
}): AppQuestion {
  return {
    id: row.id,
    index: row.index,
    type: normalizeQuestionType(row.type),
    stem: row.stem,
    answer: row.answer ?? "",
    category: row.category ?? undefined,
    choices: coerceChoices(row.choices), // ✅ Choice[] | undefined
    media: coerceMedia(row.media), // ✅ Media | undefined
  };
}

/** Count questions (optionally by exam). Works whether or not you added an `examKey` column.
 *  If you DO have examKey column, the OR lets the same code work either way.
 */
export async function getQuestionsCount(examKey?: string) {
  if (!examKey) return prisma.question.count();
  const where = await whereByExamKey(examKey); // fully typed
  return prisma.question.count({ where });
}

/** Fetch questions by examKey (ordered), with simple pagination. */
export async function getQuestionsByExam(options: {
  examKey: string;
  limit?: number;
  offset?: number;
  includeAnswer?: boolean; // set false to hide answers in UI
}) {
  const { examKey, limit = 50, offset = 0, includeAnswer = true } = options;

  const rows = await prisma.question.findMany({
    where: await whereByExamKey(examKey),
    orderBy: [{ index: "asc" }, { createdAt: "asc" }],
    skip: offset,
    take: limit,
    select: {
      id: true,
      index: true,
      type: true,
      stem: true,
      ...(includeAnswer ? { answer: true } : {}), // ✅ no `false`
      category: true,
      choices: true,
      media: true,
    },
  });

  return rows.map(toAppQuestion);
}

/** Random sample across ALL questions (Postgres ORDER BY random()).
 *  Note: fine for hundreds/thousands; for huge tables consider a better sampler.
 */
export async function pickFromAllBanksDB(count: number) {
  const n = Math.max(1, Math.min(count, 500));
  // Prisma doesn’t expose random() ordering directly -> use $queryRaw
  const rows = await prisma.$queryRaw<
    Array<{
      id: string;
      index: number;
      type: string;
      stem: string;
      answer: string | null;
      category: string | null;
      choices: unknown | null;
      media: unknown | null;
    }>
  >`
    SELECT id, index, type, stem, answer, category, choices, media
    FROM "Question"
    ORDER BY random()
    LIMIT ${n}
  `;
  // Reindex client-side to 1..n
  return rows.map(toAppQuestion).map((q, i) => ({ ...q, index: i + 1 }));
}

/** Load an "exam" by key (just the questions; meta can be added later if you create an Exam table). */
export async function loadExamByKeyFromDB(examKey: string) {
  const questions = await getQuestionsByExam({
    examKey,
    limit: 1000,
    offset: 0,
  });
  return { meta: undefined as Record<string, unknown> | undefined, questions };
}

/** Convenience: fetch one question by the full (namespaced) id, e.g. "shsat_2018:Q58" */
export async function getQuestionById(id: string) {
  const row = await prisma.question.findUnique({
    where: { id },
    select: {
      id: true,
      index: true,
      type: true,
      stem: true,
      answer: true,
      category: true,
      choices: true,
      media: true,
    },
  });
  return row ? toAppQuestion(row) : null;
}
