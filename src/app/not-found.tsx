// app/not-found.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-6 py-16">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border">
          <span className="text-lg font-semibold">404</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold">
          This page isn’t ready yet
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          We’re still building this section. Check back soon—or head to the
          homepage.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
          <Link href="/">
            <Button variant="outline">Explore features</Button>
          </Link>
        </div>

        <p className="mt-6 text-xs text-neutral-500">
          If you typed a URL, double-check it. Otherwise, it’s probably a new
          feature we’re cooking 👩‍🍳
        </p>
      </div>
    </main>
  );
}
