import { NextResponse } from "next/server";
import {
  loadAllQuestionsFromDir,
  shuffle,
  pickFromAllBanks,
  loadExamByKey,
} from "@/lib/database/loadAllBanks.server";
import { pickShsat57 } from "@/lib/selectors/pickShsat57";
import type { RawQuestion, Question } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    // explicit exam key branch
    const examKey = url.searchParams.get("exam");
    if (examKey) {
      const randomize = url.searchParams.get("randomize") !== "false";
      const { meta, questions } = await loadExamByKey(examKey);

      const items = randomize ? shuffle(questions) : questions;
      const out = items.map((q, i) => ({ ...q, index: i + 1 }));

      // Keep meta if present (minutes/label, etc.)
      return NextResponse.json({
        meta, // e.g. { minutes: 90, label: "SHSAT 2018" }
        total: out.length,
        questions: out,
      });
    }

    const preset = url.searchParams.get("preset");
    const count = Number(url.searchParams.get("count") ?? "0");
    const randomize = url.searchParams.get("randomize") !== "false";

    if (preset === "shsat57") {
      const all: RawQuestion[] = await loadAllQuestionsFromDir();
      const set: Question[] = pickShsat57(all, {
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
      });
      return NextResponse.json({ total: set.length, questions: set });
    }

    // Default branch
    if (!count || count <= 0) {
      const all: RawQuestion[] = await loadAllQuestionsFromDir();
      const items = randomize ? shuffle(all) : all;
      // Re-index for UI before returning
      const out: Question[] = items.map((q, i) => ({ ...q, index: i + 1 }));
      return NextResponse.json({ total: out.length, questions: out });
    }

    // If pickFromAllBanks still expects RawQuestion[], make it return Question[]
    const selected = await pickFromAllBanks(count, randomize); // ensure it re-indexes
    return NextResponse.json({ total: selected.length, questions: selected });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error("GET /api/questions error:", err);
    return NextResponse.json(
      { error: "Failed to load questions", detail },
      { status: 500 }
    );
  }
}
