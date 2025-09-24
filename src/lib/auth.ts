// src/lib/auth.ts

import "server-only";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function getCurrentUser() {
  const { userId } = await auth();
  if (!userId) return null;
  return prisma.user.findUnique({
    where: { externalAuthId: userId },
  });
}
