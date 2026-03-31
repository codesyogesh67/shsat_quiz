"use client";

import Link from "next/link";
import * as React from "react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Calculator, FileBarChart2 } from "lucide-react";
import { MobileSidebar } from "./mobile-sidebar";
import { NavLinks } from "./nav-links";

const Navbar = () => {
  const [open, setOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-3 sm:px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          <span className="text-sm font-semibold tracking-wide">
            SHSAT Guide
          </span>
        </Link>

        <nav className="hidden md:block">
          <NavLinks />
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="ghost">Sign in</Button>
            </SignInButton>
            <Link href="/diagnostic">
              <Button>
                <FileBarChart2 className="mr-2 h-4 w-4" />
                Take Diagnostic
              </Button>
            </Link>
          </SignedOut>

          <SignedIn>
            <Link href="/diagnostic">
              <Button variant="outline">Diagnostic</Button>
            </Link>
            <Link href="/practice">
              <Button>Start Practice</Button>
            </Link>
            <UserButton
              appearance={{ elements: { userButtonAvatarBox: "h-8 w-8" } }}
            />
          </SignedIn>
        </div>

        {/* <MobileSidebar open={open} setOpen={setOpen} /> */}
      </div>
    </header>
  );
};

export default Navbar;
