// src/lib/auth.ts
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function getSession() {
  return auth(); // { userId, ... }
}

export async function getCurrentUser() {
  const session = auth();
  if (!session.userId) return null;
  // Always go via your DB row
  return prisma.user.findUnique({ where: { externalAuthId: session.userId } });
}
