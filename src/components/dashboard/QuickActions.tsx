import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Timer, Target, Flag, Sparkles } from "lucide-react";

export function QuickActions() {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Jump back into practice.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        <Button asChild variant="outline">
          <Link href="/exam?mode=random&count=57">
            <Timer className="mr-2 h-4 w-4" /> Start Full 57
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/practice?category=Geometry&count=20">
            <Target className="mr-2 h-4 w-4" /> 20 Geometry Qs
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/flags">
            <Flag className="mr-2 h-4 w-4" /> Review Flagged
          </Link>
        </Button>
        <Button asChild>
          <Link href="/ai/trainer">
            <Sparkles className="mr-2 h-4 w-4" /> AI Explain My Mistakes
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
