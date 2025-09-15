import { NextResponse } from "next/server";
import {
  loadAnswersForExam,
  resolveDatabaseDir,
} from "@/lib/database/loadAllBanks.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const examKey = url.searchParams.get("exam");
    if (!examKey) {
      return NextResponse.json({ error: "Missing exam" }, { status: 400 });
    }

    const base = resolveDatabaseDir();
    const map = await loadAnswersForExam(examKey, base);

    const answers = Object.keys(map)
      .map((k) => ({ index: Number(k), answer: map[Number(k)] }))
      .sort((a, b) => a.index - b.index);

    return NextResponse.json({ exam: examKey, total: answers.length, answers });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error("GET /api/answers error:", err);
    return NextResponse.json(
      { error: "Failed to load answers", detail },
      { status: 500 }
    );
  }
}
