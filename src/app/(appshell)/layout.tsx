import type { ReactNode } from "react";
import AppSidebar from "@/components/dashboard/app-sidebar";
import MobileNavigation from "@/components/navigation/mobile-navigation";
import { Sparkles } from "lucide-react";
import Link from "next/link";

export default function AppShellLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <div className="flex min-h-screen w-full">
        <div className="relative hidden w-20 shrink-0 md:block">
          <AppSidebar />
        </div>

        <div className="min-w-0 flex-1">
          <div className="sticky top-0 z-30 flex justify-between h-16 items-center border-b border-slate-200/70 bg-white/80 px-4 backdrop-blur md:hidden">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center app-icon-filled">
                <Sparkles className="h-5 w-5" />
              </div>

              <div className="leading-tight">
                <p className="text-sm font-semibold tracking-wide text-slate-900">
                  SHSAT Guide
                </p>
                <p className="text-xs text-slate-500">Math Prep Platform</p>
              </div>
            </Link>
            <MobileNavigation />
          </div>

          <main className="min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.10),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.10),transparent_26%)] md:min-h-screen">
            <div className="h-full px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
