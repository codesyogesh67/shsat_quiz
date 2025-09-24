import "server-only";
import { NextResponse } from "next/server";
// ⚠️ Avoid "@/lib/prisma" if your scripts/tsconfig paths aren't set—use a relative path that exists
import prisma from "@/lib/prisma"; // adjust if your prisma.ts lives in src/lib/prisma

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const total = await prisma.question.count();
    // helpful log while debugging
    console.log("questions.count =", total);
    return NextResponse.json(
      { total },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("count route error:", err);

    const detail =
      err instanceof Error
        ? err.message
        : typeof err === "string"
        ? err
        : JSON.stringify(err);
    return NextResponse.json(
      { error: "DB error", detail: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}
