// components/site-footer.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calculator, ArrowUpRight, ChevronUp } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200/70 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:px-10 lg:px-20 xl:px-28">
        <div className="flex flex-col gap-8">
          {/* Top row */}
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Brand + description */}
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

            {/* Navigation row */}
            <nav className="flex flex-wrap items-center gap-x-9 gap-y-3 text-sm ">
              <FooterLink href="/practice" label="Practice" />
              <FooterLink href="/dashboard" label="Dashboard" />
              <FooterLink href="/pricing" label="Pricing" />
              <FooterLink href="/diagnostic" label="Diagnostic" />
            </nav>
          </div>

          {/* Bottom row */}
          <div className="flex flex-col gap-4 border-t border-slate-200/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              © {year} SHSAT Guide. All rights reserved.
            </p>

            <div className="flex items-center gap-3">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-9 rounded-xl border-slate-200 bg-white px-3 text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50"
              >
                <a href="#top" aria-label="Back to top">
                  <ChevronUp className="mr-1 h-4 w-4" />
                  Back to top
                </a>
              </Button>

              {/* <Button
                asChild
                size="sm"
                className="h-9 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 text-white shadow-lg shadow-indigo-500/20 hover:opacity-95"
              >
                <Link href="/pricing">
                  Start free
                  <ArrowUpRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button> */}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="font-medium text-sm text-indigo-600 transition-colors hover:text-indigo-900 "
    >
      {label}
    </Link>
  );
}
