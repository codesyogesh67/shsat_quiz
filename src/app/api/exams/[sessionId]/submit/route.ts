import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const session = await prisma.session.update({
    where: { id: sessionId },
    data: { submittedAt: new Date() },
    select: {
      scoreCorrect: true,
      scoreTotal: true,
      submittedAt: true,
      minutes: true,
    },
  });
  return NextResponse.json({ ok: true, ...session });
}
