// app/(onboarding)/layout.tsx
import type { ReactNode } from "react";

export default function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-5xl px-4 py-8">{children}</div>
    </div>
  );
}
