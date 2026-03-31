import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import ExamShell from "@/components/exam/ExamShell";
import type { ExamQuestion, Choice } from "@/types/exam";

type PageProps = {
  params: Promise<{
    sessionId: string;
  }>;
};

type BaseExamQuestion = Omit<ExamQuestion, "index">;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isChoice(value: unknown): value is Choice {
  return (
    isRecord(value) &&
    typeof value.key === "string" &&
    typeof value.text === "string"
  );
}

function normalizeChoices(value: unknown): Choice[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isChoice);
}

function normalizeMedia(value: unknown): ExamQuestion["media"] | undefined {
  if (!isRecord(value)) return undefined;

  if (value.type !== "image") return undefined;
  if (typeof value.url !== "string" || value.url.length === 0) return undefined;

  return {
    type: "image",
    url: value.url,
    alt: typeof value.alt === "string" ? value.alt : undefined,
  };
}

function normalizeQuestionIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((id): id is string => typeof id === "string");
}

export default async function SessionPage({ params }: PageProps) {
  const { sessionId } = await params;

  if (!sessionId) notFound();

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      minutes: true,
      mode: true,
      questionIds: true,
    },
  });

  if (!session) notFound();

  const questionIds = normalizeQuestionIds(session.questionIds);

  if (questionIds.length === 0) notFound();

  const questionsFromDb = await prisma.question.findMany({
    where: {
      id: {
        in: questionIds,
      },
    },
    select: {
      id: true,
      type: true,
      category: true,
      stem: true,
      choices: true,
      media: true,
    },
  });

  const byId = new Map<string, BaseExamQuestion>(
    questionsFromDb.map((q): [string, BaseExamQuestion] => [
      q.id,
      {
        id: q.id,
        type: q.type,
        category: q.category ?? null,
        stem: q.stem,
        choices: normalizeChoices(q.choices),
        media: normalizeMedia(q.media),
      },
    ])
  );

  const orderedQuestionsMaybe: Array<
    ExamQuestion | undefined
  > = questionIds.map((id, idx) => {
    const q = byId.get(id);
    if (!q) return undefined;

    return {
      ...q,
      index: idx + 1,
    };
  });

  const orderedQuestions = orderedQuestionsMaybe.filter(
    (q): q is ExamQuestion => q !== undefined
  );

  if (orderedQuestions.length === 0) notFound();

  const normalizedMode = session.mode === "diagnostic" ? "diagnostic" : "exam";

  return (
    <ExamShell
      sessionId={session.id}
      minutes={session.minutes ?? 30}
      questions={orderedQuestions}
      mode={normalizedMode}
    />
  );
}
