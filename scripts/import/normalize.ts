import type { Prisma } from "@prisma/client";
import type { RawQuestion } from "@/types";

// export type RawQuestion = {
//   id: string;
//   index: number;
//   type: string;
//   category?: string;
//   stem: string;
//   answer: string;
//   choices?: unknown;
//   media?: unknown;
// };

function cleanJson(value: unknown): Prisma.InputJsonValue | undefined {
  if (value === undefined || value === null) return undefined;
  // Ensure it's serializable: objects/arrays/numbers/strings/booleans/null
  // If it’s a string that looks like JSON, try parsing—otherwise keep as string.
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed as Prisma.InputJsonValue;
    } catch {
      return (value as unknown) as Prisma.InputJsonValue;
    }
  }
  return value as Prisma.InputJsonValue;
}

export function normalizeOne(
  q: RawQuestion
): Prisma.QuestionCreateManyInput | null {
  // minimal guards; scanner already validated
  if (!q?.id || typeof q.id !== "string") return null;
  if (typeof q.index !== "number") return null;
  if (!q.type || !q.stem || !q.answer) return null;

  return {
    id: q.id,
    index: q.index,
    type: q.type.trim(),
    category: q.category?.trim(),
    stem: q.stem,
    answer: q.answer,
    choices: cleanJson(q.choices),
    media: cleanJson(q.media),
    // createdAt omitted => DB default(now())
  };
}
