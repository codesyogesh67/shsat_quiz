import "server-only";
import prisma from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";

/** Ensure a Clerk user has a corresponding row in Prisma.User */
export async function ensureUserByClerkId(clerkUserId: string) {
  const c = await clerkClient.users.getUser(clerkUserId);

  const email =
    c.primaryEmailAddress?.emailAddress ||
    c.emailAddresses[0]?.emailAddress ||
    `${clerkUserId}@unknown.local`;
  const name =
    [c.firstName, c.lastName].filter(Boolean).join(" ") || c.username || email;
  const imageUrl = c.imageUrl || undefined;

  // externalAuthId maps exactly to Clerk user id
  const user = await prisma.user.upsert({
    where: { externalAuthId: clerkUserId },
    update: { email: email ?? undefined, name, imageUrl },
    create: {
      externalAuthId: clerkUserId,
      ...(email ? { email } : {}),
      name,
      imageUrl,
    },
  });

  return user;
}
