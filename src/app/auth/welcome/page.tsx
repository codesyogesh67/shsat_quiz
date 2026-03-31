// app/auth/welcome/page.tsx  (Server Component)

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ensureUserByClerkId } from "@/lib/auth/ensureUser.server";

export default async function Welcome() {
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");
  // creates/updates prisma.User where externalAuthId = userId

  await ensureUserByClerkId(userId);
  redirect("/dashboard");
}
