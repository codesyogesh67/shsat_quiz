import { NextResponse } from "next/server";
import {
  loadAllQuestionsFromDir,
  shuffle,
  pickFromAllBanks,
} from "@/lib/database/loadAllBanks";
import { pickShsat57 } from "@/lib/selectors/pickShsat57";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const preset = url.searchParams.get("preset"); // "shsat57" -> enforce mix
    const count = Number(url.searchParams.get("count") ?? "0");
    const randomize = url.searchParams.get("randomize") !== "false";

    // Optional overrides
    const gridIns = Number(url.searchParams.get("gridIns") ?? "5");
    const algMin = Number(url.searchParams.get("algMin") ?? "0.40");
    const algMax = Number(url.searchParams.get("algMax") ?? "0.45");
    const geomMin = Number(url.searchParams.get("geomMin") ?? "0.30");
    const geomMax = Number(url.searchParams.get("geomMax") ?? "0.35");
    const statsMin = Number(url.searchParams.get("statsMin") ?? "0.15");
    const statsMax = Number(url.searchParams.get("statsMax") ?? "0.20");
    const strictGridIns = url.searchParams.get("strictGridIns") === "true";

    if (preset === "shsat57") {
      const all = await loadAllQuestionsFromDir();
      const set = pickShsat57(all, {
        total: 57,
        gridIns,
        algebraPctRange: [algMin, algMax],
        geometryPctRange: [geomMin, geomMax],
        statsPctRange: [statsMin, statsMax],
        strictGridIns,
      });
      return NextResponse.json({ total: set.length, questions: set });
    }

    // Fallback to your original behavior
    if (!count || count <= 0) {
      const all = await loadAllQuestionsFromDir();
      const items = randomize ? shuffle(all) : all;
      return NextResponse.json({
        total: items.length,
        questions: items.map((q, i) => ({ ...q, index: i + 1 })),
      });
    }

    const selected = await pickFromAllBanks(count, randomize);
    return NextResponse.json({ total: selected.length, questions: selected });
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
