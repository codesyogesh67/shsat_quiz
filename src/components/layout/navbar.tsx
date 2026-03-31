"use client";

import Link from "next/link";
import * as React from "react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { MobileSidebar } from "./mobile-sidebar";
import { NavLinks } from "./nav-links";

const Navbar = () => {
  const [open, setOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[radial-gradient(60rem_35rem_at_15%_-10%,rgba(99,102,241,0.16),transparent_55%),radial-gradient(42rem_24rem_at_85%_0%,rgba(139,92,246,0.12),transparent_55%)]">
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-3 sm:px-4 md:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20">
            <Sparkles className="h-5 w-5" />
          </div>

          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-wide text-slate-900">
              SHSAT Guide
            </p>
            <p className="text-xs text-slate-500">Math Prep Platform</p>
          </div>
        </Link>

        <nav className="hidden rounded-full border border-slate-200/70 bg-white/80 p-1.5 shadow-[0_10px_30px_rgba(99,102,241,0.08)] backdrop-blur-xl md:block">
          <div className="rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.7),rgba(255,255,255,0.35))]">
            <NavLinks />
          </div>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <SignedOut>
            <SignInButton mode="modal">
              <Button
                variant="ghost"
                className="rounded-xl duration-200 bg-gradient-to-br from-indigo-600 to-violet-600 text-white hover:text-white"
              >
                Sign In
              </Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <div className="flex items-center gap-3">
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    userButtonAvatarBox: "h-9 w-9 rounded-xl",
                    userButtonTrigger:
                      "rounded-xl transition-all duration-200 focus:shadow-none focus:ring-0",
                  },
                }}
              />
            </div>
          </SignedIn>
        </div>

        <MobileSidebar open={open} setOpen={setOpen} />
      </div>
    </header>
  );
};

export default Navbar;
