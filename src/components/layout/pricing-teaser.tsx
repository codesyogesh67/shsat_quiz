"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Lock } from "lucide-react";

export default function PricingTeaser() {
  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-6 md:px-10 lg:px-20 xl:px-28 py-10">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">Start free — upgrade anytime</h2>
        <p className="text-sm text-muted-foreground">Keep practicing on Free. Go Pro when you want full power.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Free</CardTitle>
            <CardDescription>Great for getting started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Feature>Practice by category</Feature>
            <Feature>1 full exam</Feature>
            <Feature>Basic stats</Feature>
          </CardContent>
          <CardFooter>
            <Link href="/practice">
              <Button className="w-full">Get started</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="h-full border-primary/30">
          <CardHeader>
            <CardTitle>Pro</CardTitle>
            <CardDescription>Serious prep & faster progress</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Feature>Unlimited full exams</Feature>
            <Feature>AI explanations for mistakes</Feature>
            <Feature>Detailed analytics & pacing</Feature>
            <Feature>Custom practice sets</Feature>
          </CardContent>
          <CardFooter>
            <Link href="/pricing">
              <Button className="w-full">See full pricing</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <Check className="h-4 w-4" />
      <span>{children}</span>
    </div>
  );
}
