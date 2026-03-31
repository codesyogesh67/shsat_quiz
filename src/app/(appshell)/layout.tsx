import type { ReactNode } from "react";
import AppSidebar from "@/components/dashboard/app-sidebar";
import MobileAppSidebar from "@/components/dashboard/mobile-app-sidebar";

export default function AppShellLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <div className="flex min-h-screen w-full">
        {/* Desktop sidebar */}
        <div className="relative hidden w-20 shrink-0 md:block">
          <AppSidebar />
        </div>

        {/* Main content area */}
        <div className="min-w-0 flex-1">
          {/* Mobile top bar */}
          <div className="sticky top-0 z-30 flex h-16 items-center border-b border-slate-200/70 bg-white/80 px-4 backdrop-blur md:hidden">
            <MobileAppSidebar />
            <div className="ml-3">
              <p className="text-sm font-semibold text-slate-900">
                SHSAT Guide
              </p>
              <p className="text-xs text-slate-500">Student Portal</p>
            </div>
          </div>

          {/* Page wrapper */}
          <main className="min-h-[calc(100vh-4rem)] md:min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.10),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.10),transparent_26%)]">
            <div className="h-full px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
