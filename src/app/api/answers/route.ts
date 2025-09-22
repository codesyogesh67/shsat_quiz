// src/app/api/answers/route.ts
import "server-only";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const examKey = url.searchParams.get("exam");
    if (!examKey) {
      return NextResponse.json({ error: "Missing exam" }, { status: 400 });
    }

    // Support both schemas:
    // 1) If you added `examKey` column, match by it
    // 2) Otherwise, fall back to namespaced id: "shsat_2018:Q58"
    const rows = await prisma.question.findMany({
      where: {
        OR: [
          // @ts-expect-error allow either schema
          { examKey },
          { id: { startsWith: `${examKey}:` } },
        ],
      } as any,
      select: { index: true, answer: true },
      orderBy: { index: "asc" },
    });

    const answers = rows
      .filter((r) => r.answer != null && String(r.answer).trim() !== "")
      .map((r) => ({ index: r.index, answer: String(r.answer) }));

    return NextResponse.json(
      { exam: examKey, total: answers.length, answers },
      { headers: { "x-data-source": "db" } }
    );
  } catch (err) {
    console.error("GET /api/answers error:", err);
    return NextResponse.json(
      { error: "Failed to load answers", detail: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}
