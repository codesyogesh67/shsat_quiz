// components/site-navbar.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Menu, Calculator } from "lucide-react";

import ComingSoonLink from "@/components/ComingSoonLink";

const nav = [
  { href: "/practice", label: "Practice" },
  { href: "/exam", label: "Full Exams" },
  { href: "/dashboard", label: "Dashboard", authed: true },
  { href: "/pricing", label: "Pricing" },
];

const Navbar = () => {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
      {nav.map((item) => {
        // if (item.href === "/dashboard") {
        //   return <ComingSoonLink key={item.href} label={item.label} />;
        // }
        const active = pathname?.startsWith(item.href);
        const cls =
          "text-sm font-medium hover:opacity-90 py-4 hover:text-blue-500 pl-4" +
          (active ? "text-primary" : "");
        if (item.authed) {
          return (
            <SignedIn key={item.href}>
              <Link href={item.href} className={cls} onClick={onClick}>
                {item.label}
              </Link>
            </SignedIn>
          );
        }
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cls}
            onClick={onClick}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-3 sm:px-4 md:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          <span className="text-sm font-semibold tracking-wide">
            SHSAT Guide
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:block">
          <div className="flex items-center gap-6">
            <NavLinks />
          </div>
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 md:flex">
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="ghost">Sign in</Button>
            </SignInButton>
            <SignInButton mode="modal">
              <Button>Get started</Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <Link href="/practice">
              <Button>Start Practice</Button>
            </Link>
            <UserButton
              appearance={{ elements: { userButtonAvatarBox: "h-8 w-8" } }}
            />
          </SignedIn>
        </div>

        {/* Mobile menu */}
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <div className="mt-6 flex items-center justify-between">
                  <SheetTitle>
                    <Link
                      href="/"
                      className="flex items-center gap-2"
                      onClick={() => setOpen(false)}
                    >
                      <Calculator className="h-5 w-5" />
                      <span className="text-sm font-semibold tracking-wide">
                        SHSAT Guide
                      </span>
                    </Link>
                  </SheetTitle>
                </div>
              </SheetHeader>
              <div className="flex ml-8">
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </div>
              <Separator className="mb-4" />

              <NavLinks onClick={() => setOpen(false)} />

              <div className="mt-6 flex gap-2">
                <SignedOut>
                  <SignInButton mode="modal">
                    <Button className="w-full">Sign in</Button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <Link
                    href="/practice"
                    onClick={() => setOpen(false)}
                    className="w-full"
                  >
                    <Button className="w-full">Starting Practice</Button>
                  </Link>
                </SignedIn>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
