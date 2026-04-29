import type { ReactNode } from "react";

export default function AppShellLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <div className="flex min-h-screen w-full">
        <div className="min-w-0 flex-1">
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
