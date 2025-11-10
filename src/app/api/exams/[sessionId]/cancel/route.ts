import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ sessionId: string }> } // 👈 params is a Promise now
) {
  const { sessionId } = await context.params; // 👈 await here!

  // 1) make sure user is logged in
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return new Response("Unauthorized", { status: 401 });
  }

  // 2) map clerk → local user
  const dbUser = await prisma.user.findUnique({
    where: { externalAuthId: clerkUserId },
    select: { id: true },
  });
  if (!dbUser) {
    return new Response("Unauthorized", { status: 401 });
  }

  // 3) get the session to make sure it's theirs and not submitted
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { id: true, userId: true, submittedAt: true },
  });

  if (!session || session.userId !== dbUser.id) {
    return new Response("Not found", { status: 404 });
  }

  if (session.submittedAt) {
    return new Response("Cannot cancel a submitted exam", { status: 400 });
  }

  // 4) delete attempts first (foreign key)
  await prisma.attempt.deleteMany({
    where: { sessionId: session.id },
  });

  // 5) delete the session itself
  await prisma.session.delete({
    where: { id: session.id },
  });

  return NextResponse.json({ ok: true });
}
