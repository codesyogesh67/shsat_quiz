"use client";

import Link from "next/link";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

import { cn } from "@/lib/utils";
import { navItems } from "@/components/navigation/nav-config";

export function NavLinks({ onClick }: { onClick?: () => void }) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-1.5">
      <SignedOut>
        {navItems.map((item) => {
          if (item.requiresAuth) {
            return (
              <SignInButton key={item.href} mode="modal">
                <button
                  type="button"
                  onClick={onClick}
                  className={cn(
                    "group relative inline-flex items-center justify-center overflow-hidden rounded-full",
                    "px-4 py-2 text-sm font-medium",
                    "hover:-translate-y-0",
                    "hover:bg-gradient-to-r from-indigo-600 to-violet-600 hover:text-white"
                  )}
                >
                  <span className="absolute inset-0 rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.55),rgba(255,255,255,0.08))] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                  <span className="absolute inset-x-4 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-300/70 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                  <span className="relative z-10">{item.label}</span>
                </button>
              </SignInButton>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClick}
              className={cn(
                "group relative inline-flex items-center justify-center overflow-hidden rounded-full",
                "px-4 py-2 text-sm font-medium",
                "hover:-translate-y-0",
                "hover:bg-gradient-to-r from-indigo-600 to-violet-600 hover:text-white"
              )}
            >
              <span className="absolute inset-0 rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.55),rgba(255,255,255,0.08))] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
              <span className="absolute inset-x-4 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-300/70 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </SignedOut>

      <SignedIn>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClick}
            className={cn(
              "group relative inline-flex items-center justify-center overflow-hidden rounded-full",
              "px-4 py-2 text-sm font-medium",
              "hover:-translate-y-0",
              "hover:bg-gradient-to-r from-indigo-600 to-violet-600 hover:text-white"
            )}
          >
            <span className="absolute inset-0 rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.55),rgba(255,255,255,0.08))] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
            <span className="absolute inset-x-4 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-300/70 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
            <span className="relative z-10">{item.label}</span>
          </Link>
        ))}
      </SignedIn>
    </div>
  );
}
