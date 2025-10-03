// app/api/category-counts/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const grouped = await prisma.question.groupBy({
      by: ["category"],
      _count: { _all: true },
    });

    const counts = Object.fromEntries(
      grouped.map((g) => [g.category ?? "Uncategorized", g._count._all])
    );

    return NextResponse.json({ counts });
  } catch (e) {
    console.error("category-counts error:", e);
    // Don’t error the page—return empty and let the UI show placeholders
    return NextResponse.json({ counts: {} }, { status: 200 });
  }
}
