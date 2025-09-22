// src/lib/database/dbWhere.ts
import  { Prisma } from "@prisma/client";

/** Build a Prisma where that works whether you have an `examKey` column or not.
 *  We use `satisfies Prisma.QuestionWhereInput` + a one-line ts-expect-error
 *  on the `examKey` branch (because some schemas won’t have that column).
 */
export function whereByExamKey(examKey: string): Prisma.QuestionWhereInput {
  return {
    OR: [
      // @ts-expect-error: `examKey` might not exist in this project's generated client
      { examKey },
      { id: { startsWith: `${examKey}:` } },
    ],
  } satisfies Prisma.QuestionWhereInput;
}
