import "server-only";
import prisma from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";

const TRIAL_DAYS = 7;

export async function ensureUserByClerkId(clerkUserId: string) {
  const clerk = await clerkClient();
  const c = await clerk.users.getUser(clerkUserId);

  const email =
    c.primaryEmailAddress?.emailAddress ||
    c.emailAddresses?.[0]?.emailAddress ||
    `${clerkUserId}@unknown.local`;

  const name =
    [c.firstName, c.lastName].filter(Boolean).join(" ") || c.username || email;

  const imageUrl = c.imageUrl || undefined;

  const now = new Date();
  const trialEndsAt = new Date(
    now.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000
  );

  const user = await prisma.user.upsert({
    where: { externalAuthId: clerkUserId },
    update: {
      email: email ?? undefined,
      name,
      imageUrl,
    },
    create: {
      externalAuthId: clerkUserId,
      ...(email ? { email } : {}),
      name,
      imageUrl,
      planType: "TRIAL",
      trialStartedAt: now,
      trialEndsAt,
    },
  });

  // Backfill old TRIAL users that were created before this logic existed
  if (
    user.planType === "TRIAL" &&
    (!user.trialStartedAt || !user.trialEndsAt)
  ) {
    return prisma.user.update({
      where: { id: user.id },
      data: {
        trialStartedAt: user.trialStartedAt ?? now,
        trialEndsAt: user.trialEndsAt ?? trialEndsAt,
      },
    });
  }

  return user;
}
