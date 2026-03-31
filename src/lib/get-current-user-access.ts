import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { getUserAccess } from "@/lib/access";

export async function getCurrentUserAccess() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return getUserAccess(null);
  }

  const user = await prisma.user.findUnique({
    where: { externalAuthId: clerkUserId },
    select: {
      planType: true,
      trialStartedAt: true,
      trialEndsAt: true,
      premiumStartedAt: true,
      premiumEndsAt: true,
    },
  });

  return getUserAccess(user);
}
