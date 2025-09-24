// src/lib/database/dbWhere.ts
import { Prisma } from "@prisma/client";

export function whereByExamKey(examKey: string): Prisma.QuestionWhereInput {
  const OR: unknown[] = [
    { id: { startsWith: `${examKey}:` } }, // always valid
    { examKey }, // may not exist in some schemas
  ];
  // Localize the cast to the return, no ts-expect-error needed
  return ({ OR } as unknown) as Prisma.QuestionWhereInput;
}
