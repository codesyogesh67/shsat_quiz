"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

export const nav = [
  { href: "/practice", label: "Practice" },
  { href: "/exam", label: "Full Exams" },
  { href: "/dashboard", label: "Dashboard", authed: true },
  { href: "/pricing", label: "Pricing" },
];

type NavLinksProps = {
  onClick?: () => void;
};

export function NavLinks({ onClick }: NavLinksProps) {
  const pathname = usePathname();

  const renderLink = (href: string, label: string) => {
    const active = pathname.startsWith(href);

    return (
      <Link
        key={href}
        href={href}
        onClick={onClick}
        className={cn(
          "flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition",
          active
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        {label}
      </Link>
    );
  };

  return (
    <nav className="flex flex-col gap-1">
      {nav.map(({ href, label, authed }) => {
        if (authed) {
          return <SignedIn key={href}>{renderLink(href, label)}</SignedIn>;
        }

        // public links: always visible
        return renderLink(href, label);
      })}
    </nav>
  );
}
