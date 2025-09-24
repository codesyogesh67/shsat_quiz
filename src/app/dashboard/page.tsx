// app/dashboard/page.tsx
import { auth } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  const { userId } = auth();
  // Since middleware protects, userId exists here
  return <div>Welcome to your dashboard</div>;
}
