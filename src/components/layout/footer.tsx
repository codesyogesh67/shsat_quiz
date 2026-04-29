// components/site-footer.tsx
"use client";

import Link from "next/link";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Calculator, ChevronUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { navItems } from "@/components/navigation/nav-config";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200/70 bg-white/95 backdrop-blur">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 md:px-10 lg:px-20 xl:px-28">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <Link href="/" className="inline-flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center app-icon-filled">
                  <Calculator className="h-5 w-5" />
                </div>

                <div>
                  <div className="text-sm font-semibold tracking-wide text-slate-900">
                    SHSAT Guide
                  </div>
                  <div className="text-xs text-slate-500">
                    Math prep platform for focused SHSAT practice
                  </div>
                </div>
              </Link>

              <p className="mt-4 text-sm leading-6 text-slate-600">
                Target weak topics, improve timing, and track progress with a
                clean practice experience built for students preparing with
                intention.
              </p>
            </div>

            <FooterNavLinks />
          </div>

          <div className="flex flex-col gap-4 border-t border-slate-200/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              © {year} SHSAT Guide. All rights reserved.
            </p>

            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-9 w-fit rounded-xl border-slate-200 bg-white px-3 text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50"
            >
              <a href="#top" aria-label="Back to top">
                <ChevronUp className="mr-1 h-4 w-4" />
                Back to top
              </a>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterNavLinks() {
  return (
    <nav className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
      <SignedOut>
        {navItems.map((item) => {
          if (item.requiresAuth) {
            return (
              <SignInButton key={item.href} mode="modal">
                <button type="button" className={footerLinkClassName}>
                  {item.label}
                </button>
              </SignInButton>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={footerLinkClassName}
            >
              {item.label}
            </Link>
          );
        })}
      </SignedOut>

      <SignedIn>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={footerLinkClassName}
          >
            {item.label}
          </Link>
        ))}
      </SignedIn>
    </nav>
  );
}

const footerLinkClassName = cn(
  "group relative inline-flex items-center justify-center overflow-hidden rounded-full",
  "px-4 py-2 text-sm font-medium text-slate-600",
  "transition-all duration-300",
  "hover:bg-gradient-to-r hover:from-indigo-600 hover:to-violet-600 hover:text-white"
);
