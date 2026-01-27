// app/(admin)/admin/import/actions.ts
"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

function assertAdminEmail(email: string | null | undefined) {
  if (!email) throw new Error("Not authenticated.");
  if (!ADMIN_EMAILS.includes(email.toLowerCase())) {
    throw new Error("Not authorized.");
  }
}

const MediaSchema = z
  .object({
    type: z.string().optional(), // e.g. "image"
    url: z.string().optional(),
    alt: z.string().optional(),
  })
  .passthrough()
  .optional();

const ChoiceSchema = z
  .object({
    id: z.string().optional(),
    text: z.string(),
    correct: z.boolean().optional(),
  })
  .passthrough();

const QuestionSchema = z.object({
  id: z.string().optional(),
  index: z.number().int().optional(),
  type: z.string(), // "MULTIPLE_CHOICE" | "FREE_RESPONSE" | etc.
  category: z.string().nullable().optional(),
  stem: z.string(),
  media: MediaSchema.or(z.any()).optional(), // allow your existing shape
  choices: z.array(ChoiceSchema).optional(),
  answer: z.string().nullable().optional(),
});

const PayloadSchema = z.object({
  examKey: z.string().min(1, "examKey is required"),
  questions: z.array(QuestionSchema).min(1),
});

export type ImportResult = {
  inserted: number;
  examKey: string;
};

export async function importQuestions(raw: unknown): Promise<ImportResult> {
  const user = await currentUser();
  assertAdminEmail(user?.primaryEmailAddress?.emailAddress);

  const { examKey, questions } = PayloadSchema.parse(raw);

  // Optional: clear existing with the same examKey before inserting
  // await prisma.question.deleteMany({ where: { examKey } });

  // Insert in batches for safety
  const data = questions.map((q) => ({
    index: q.index ?? null,
    type: q.type,
    category: q.category ?? null,
    stem: q.stem,
    media: q.media ?? null,
    choices: q.choices ?? null,
    answer: q.answer ?? null,
    examKey,
  }));

  // If you need idempotency, consider a unique composite (examKey, index)
  // and use upserts. For simplicity, use createMany here.
  const res = await prisma.question.createMany({
    data,
    skipDuplicates: true, // respects unique constraints if any
  });

  return { inserted: res.count, examKey };
}

export async function deleteByExamKey(examKey: string) {
  const user = await currentUser();
  assertAdminEmail(user?.primaryEmailAddress?.emailAddress);

  if (!examKey) throw new Error("examKey required");
  const res = await prisma.question.deleteMany({ where: { examKey } });
  return { deleted: res.count, examKey };
}
