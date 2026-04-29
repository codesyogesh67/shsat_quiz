"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  UserButton,
} from "@clerk/nextjs";
import { LogOut, Menu, Sparkles, User, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { navItems, signedInOnlyNavItems } from "./nav-config";

export default function MobileNavigation() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            aria-label="Open menu"
            className="rounded-2xl border border-slate-200/70 bg-white/80 text-slate-700 shadow-sm backdrop-blur-xl hover:bg-slate-100"
          >
            <Menu className="h-5 w-5 cursor-pointer" />
          </Button>
        </SheetTrigger>

        <SheetContent
          side="right"
          className="w-[24rem] max-w-[92vw] border-l border-slate-200/70 bg-white p-0 [&>button]:hidden"
        >
          <div className="flex h-full flex-col">
            <SheetHeader className="border-b border-slate-200/70 px-5 py-5">
              <div className="flex items-center justify-between gap-4">
                <SheetTitle asChild>
                  <Link
                    href="/"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl app-icon-filled">
                      <Sparkles className="h-5 w-5" />
                    </div>

                    <div className="text-left leading-tight">
                      <p className="text-sm font-semibold text-slate-900">
                        SHSAT Guide
                      </p>
                      <p className="text-xs text-slate-500">
                        Math Prep Platform
                      </p>
                    </div>
                  </Link>
                </SheetTitle>

                <div className="flex items-center gap-2">
                  <SignedIn>
                    <UserButton
                      afterSignOutUrl="/"
                      appearance={{
                        elements: {
                          userButtonAvatarBox: "h-8 w-8 rounded-xl",
                          userButtonTrigger:
                            "rounded-xl transition-all duration-200 focus:shadow-none focus:ring-0",
                        },
                      }}
                    />
                  </SignedIn>

                  <SheetClose asChild>
                    <Button
                      type="button"
                      variant="ghost_icon"
                      size="icon"
                      aria-label="Close menu"
                      className="rounded-xl text-slate-700 hover:bg-slate-100"
                    >
                      <X className="h-5 w-5 text-indigo-600" />
                    </Button>
                  </SheetClose>
                </div>
              </div>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              <nav className="space-y-2">
                <SignedOut>
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const active =
                      pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);

                    if (item.requiresAuth) {
                      return (
                        <SignInButton key={item.href} mode="modal">
                          <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className={cn(
                              "flex h-14 w-full items-center gap-3 rounded-2xl px-3 text-sm font-medium transition-colors",
                              active
                                ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            )}
                          >
                            <span
                              className={cn(
                                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                                active
                                  ? "bg-transparent text-white"
                                  : "bg-slate-100 text-slate-600"
                              )}
                            >
                              <Icon className="h-5 w-5" />
                            </span>
                            <span>{item.label}</span>
                          </button>
                        </SignInButton>
                      );
                    }

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex h-14 items-center gap-3 rounded-2xl px-3 text-sm font-medium transition-colors",
                          active
                            ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                            active
                              ? "bg-transparent text-white app-icon-filled"
                              : "bg-slate-100 text-slate-600"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </span>
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}

                  <SignInButton mode="modal">
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="flex h-14 w-full items-center gap-3 rounded-2xl px-3 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-50 hover:text-indigo-700"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                        <User className="h-5 w-5" />
                      </span>
                      <span>Sign in</span>
                    </button>
                  </SignInButton>
                </SignedOut>

                <SignedIn>
                  {[...navItems, ...signedInOnlyNavItems].map((item) => {
                    const Icon = item.icon;
                    const active =
                      pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex h-14 items-center gap-3 rounded-2xl px-3 text-sm font-medium transition-colors",
                          active
                            ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                            active
                              ? "bg-transparent text-white app-icon-filled"
                              : "bg-slate-100 text-slate-600"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </span>
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}

                  <SignOutButton redirectUrl="/">
                    <button
                      type="button"
                      className="flex h-14 w-full items-center gap-3 rounded-2xl px-3 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
                        <LogOut className="h-5 w-5" />
                      </span>
                      <span>Log out</span>
                    </button>
                  </SignOutButton>
                </SignedIn>
              </nav>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
