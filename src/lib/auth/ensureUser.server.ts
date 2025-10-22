import "server-only";
import prisma from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";

/** Ensure a Clerk user has a corresponding row in Prisma.User */
export async function ensureUserByClerkId(clerkUserId: string) {
  // 👇 Get the client instance first (v5+)
  const clerk = await clerkClient();
  const c = await clerk.users.getUser(clerkUserId);

  const email =
    c.primaryEmailAddress?.emailAddress ||
    c.emailAddresses?.[0]?.emailAddress ||
    `${clerkUserId}@unknown.local`;

  const name =
    [c.firstName, c.lastName].filter(Boolean).join(" ") || c.username || email;

  const imageUrl = c.imageUrl || undefined;

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
