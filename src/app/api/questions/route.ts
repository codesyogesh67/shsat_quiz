import "server-only";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  getQuestionsByExam,
  getQuestionsCount,
  pickFromAllBanksDB,
} from "@/lib/database/loadFromDb.server";
import { pickShsat57 } from "@/lib/selectors/pickShsat57";
import type { Question, RawQuestion } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toAppQuestion(row: {
  id: string;
  index: number;
  type: string;
  stem: string;
  answer: string | null;
  category: string | null;
  choices: unknown | null;
  media: unknown | null;
}): Question {
  return {
    id: row.id,
    index: row.index,
    type: row.type,
    stem: row.stem,
    answer: row.answer ?? "",
    category: row.category ?? undefined,
    choices: row.choices ?? undefined,
    media: row.media ?? undefined,
  };
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    // --- Case 1: explicit exam key ---
    const examKey = url.searchParams.get("exam");
    if (examKey) {
      const randomize = url.searchParams.get("randomize") !== "false";
      const questions = await getQuestionsByExam({
        examKey,
        limit: 1000,
        offset: 0,
        includeAnswer: true,
      });

      const items = randomize
        ? [...questions].sort(() => Math.random() - 0.5)
        : questions;
      const out = items.map((q, i) => ({ ...q, index: i + 1 }));

      return NextResponse.json({
        meta: undefined, // you can add Exam meta later if you create an Exam table
        total: out.length,
        questions: out,
      });
    }

    // --- Case 2: preset "shsat57" (composition via DB) ---
    const preset = url.searchParams.get("preset");
    if (preset === "shsat57") {
      // Pull ALL questions, then let your selector shape the 57-set
      const rows = await prisma.question.findMany({
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

      const all = rows.map(toAppQuestion);

      const set = (pickShsat57((all as unknown) as RawQuestion[], {
        total: 57,
        gridIns: Number(url.searchParams.get("gridIns") ?? "5"),
        algebraPctRange: [
          Number(url.searchParams.get("algMin") ?? "0.40"),
          Number(url.searchParams.get("algMax") ?? "0.45"),
        ],
        geometryPctRange: [
          Number(url.searchParams.get("geomMin") ?? "0.30"),
          Number(url.searchParams.get("geomMax") ?? "0.35"),
        ],
        statsPctRange: [
          Number(url.searchParams.get("statsMin") ?? "0.15"),
          Number(url.searchParams.get("statsMax") ?? "0.20"),
        ],
      }) as unknown) as Question[];

      return NextResponse.json({ total: set.length, questions: set });
    }

    // --- Case 3: custom quiz (count + randomize) ---
    const count = Number(url.searchParams.get("count") ?? "0");
    const randomize = url.searchParams.get("randomize") !== "false";

    // Page boot: your UI probes maxCount via ?count=0
    if (!count || count <= 0) {
      const total = await getQuestionsCount();
      return NextResponse.json({ total, questions: [] });
    }

    if (randomize) {
      const questions = await pickFromAllBanksDB(count);
      return NextResponse.json({ total: questions.length, questions });
    }

    // Non-random: first N by createdAt, then index
    const rows = await prisma.question.findMany({
      orderBy: [{ createdAt: "asc" }, { index: "asc" }],
      take: Math.min(count, 500),
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
    const questions = rows.map(toAppQuestion);
    return NextResponse.json({ total: questions.length, questions });
  } catch (err) {
    console.error("GET /api/questions error:", err);
    return NextResponse.json(
      {
        error: "Failed to load questions",
        detail: String(err?.message ?? err),
      },
      { status: 500 }
    );
  }
}
