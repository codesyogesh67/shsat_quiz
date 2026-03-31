import { Suspense } from "react";
import SessionPageShell from "@/components/session/SessionPageShell";

export const metadata = {
  title: "Practice Session | SHSAT Practice",
};

export default function PracticeSessionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm">
              <div className="space-y-3">
                <div className="h-5 w-40 animate-pulse rounded-lg bg-slate-200" />
                <div className="h-4 w-72 animate-pulse rounded-lg bg-slate-100" />
                <div className="mt-6 h-64 animate-pulse rounded-2xl bg-slate-100" />
              </div>
            </div>
          </div>
        </div>
      }
    >
      <SessionPageShell />
    </Suspense>
  );
}
