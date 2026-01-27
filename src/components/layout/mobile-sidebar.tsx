"use client";

import Link from "next/link";
import { Menu, Calculator } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { X } from "lucide-react";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { NavLinks } from "@/components/layout/nav-links"; // adjust path if different

type MobileSidebarProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export function MobileSidebar({ open, setOpen }: MobileSidebarProps) {
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)"); // md breakpoint

    const onChange = () => {
      if (mq.matches) setOpen(false); // close when entering md+
    };

    onChange(); // run once
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [setOpen]);
  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>

        <SheetContent side="right" className="w-80 p-0 [&>button]:hidden">
          {/* Top */}
          <SheetHeader className="border-b px-6 py-5">
            <div className="flex items-center justify-between">
              <SheetTitle asChild>
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-md px-2 py-1 transition hover:bg-muted"
                >
                  <Calculator className="h-5 w-5" />
                  <span className="text-sm font-semibold tracking-wide">
                    SHSAT Guide
                  </span>
                </Link>
              </SheetTitle>
              <div className="flex items-center gap-2">
                <SignedIn>
                  <div className="flex items-center">
                    <UserButton />
                  </div>
                </SignedIn>

                <SheetClose asChild>
                  <Button variant="ghost" size="icon" aria-label="Close menu">
                    <X className="h-5 w-5" />
                  </Button>
                </SheetClose>
              </div>
            </div>
          </SheetHeader>

          {/* Body */}
          <div className="px-6 py-5">
            <div className="space-y-5">
              {/* Nav */}
              <div className="rounded-xl border bg-muted/30 p-2">
                <NavLinks onClick={() => setOpen(false)} />
              </div>

              <Separator />

              {/* Actions */}
              <div className="space-y-2">
                <SignedOut>
                  <SignInButton mode="modal">
                    <Button className="w-full">Sign in</Button>
                  </SignInButton>
                </SignedOut>

                <SignedIn>
                  <Link
                    href="/practice"
                    onClick={() => setOpen(false)}
                    className="block w-full"
                  >
                    <Button className="w-full">Start Practice</Button>
                  </Link>
                </SignedIn>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
