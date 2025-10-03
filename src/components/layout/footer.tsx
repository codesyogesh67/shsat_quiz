// components/site-footer.tsx
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Calculator, Github, Twitter, Youtube, Instagram } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 md:px-10 lg:px-20 xl:px-28 py-10">
        {/* Top */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
          {/* Brand / blurb */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              <span className="text-sm font-semibold tracking-wide">
                SHSAT Guide
              </span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              Target weak topics, master timing, and track progress. Start
              free—upgrade anytime.
            </p>

            {/* Socials */}
            <div className="mt-4 flex gap-2">
              <Social href="#" label="GitHub">
                <Github className="h-4 w-4" />
              </Social>
              <Social href="#" label="Twitter / X">
                <Twitter className="h-4 w-4" />
              </Social>
              <Social href="#" label="YouTube">
                <Youtube className="h-4 w-4" />
              </Social>
              <Social href="#" label="Instagram">
                <Instagram className="h-4 w-4" />
              </Social>
            </div>
          </div>

          {/* Columns */}
          <FooterCol
            title="Product"
            links={[
              { href: "/practice", label: "Practice by Topic" },
              { href: "/exam", label: "Full Exams" },
              { href: "/dashboard", label: "Dashboard" },
              { href: "/pricing", label: "Pricing" },
            ]}
          />

          <FooterCol
            title="Resources"
            links={[
              { href: "/how-it-works", label: "How it works" },
              { href: "/faq", label: "FAQ" },
              { href: "/roadmap", label: "Roadmap" },
            ]}
          />

          <FooterCol
            title="Company"
            links={[
              { href: "/about", label: "About" },
              { href: "/contact", label: "Contact" },
              { href: "/status", label: "Status" },
            ]}
          />
        </div>

        <Separator className="my-6" />

        {/* Bottom */}
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <p className="text-xs text-muted-foreground">
            © {year} SHSAT Guide. All rights reserved.
          </p>

          <div className="flex items-center gap-4 text-xs">
            <Link
              className="hover:underline text-muted-foreground"
              href="/terms"
            >
              Terms
            </Link>
            <Link
              className="hover:underline text-muted-foreground"
              href="/privacy"
            >
              Privacy
            </Link>
            <Link
              className="hover:underline text-muted-foreground"
              href="/cookies"
            >
              Cookies
            </Link>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs"
            >
              <a href="#top" aria-label="Back to top">
                Back to top ↑
              </a>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="text-sm text-muted-foreground hover:text-foreground hover:underline"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Social({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      asChild
      variant="outline"
      size="icon"
      className="h-8 w-8"
      aria-label={label}
    >
      <a href={href} target="_blank" rel="noreferrer">
        {children}
      </a>
    </Button>
  );
}
