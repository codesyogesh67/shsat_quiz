// src/app/api/questions/by-exam/route.ts
import "server-only";
import { NextResponse } from "next/server";
import {
  getQuestionsByExam,
  getQuestionsCount,
} from "@/lib/database/loadFromDb.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const examKey = url.searchParams.get("examKey") || "shsat_2018";
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 20), 200);
  const offset = Number(url.searchParams.get("offset") ?? 0);

  const [total, data] = await Promise.all([
    getQuestionsCount(examKey),
    getQuestionsByExam({ examKey, limit, offset, includeAnswer: true }),
  ]);

  return NextResponse.json({ examKey, paging: { total, limit, offset }, data });
}
