import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ProfilePageClient from "@/components/profile/profile-page-client";
import { getCurrentUserAccess } from "@/lib/get-current-user-access";

export default async function ProfilePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const access = await getCurrentUserAccess();

  return <ProfilePageClient access={access} />;
}
