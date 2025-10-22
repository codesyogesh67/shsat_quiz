"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

export type ExamResultsData = {
  correct: number;
  total: number;
  byCategory: Record<string, { correct: number; total: number }>;
  perQuestion?: {
    id: string;
    correct: boolean;
    user?: string;
    gold?: string;
  }[];
};

export default function ExamResults({
  examSet,
  results,
  flags,
  onReview,
  onRetake,
  onPickAnother,
}: {
  examSet: string;
  results: ExamResultsData;
  flags: Record<string, boolean>;
  onReview: (filter: "wrong" | "all" | "correct" | "flagged") => void;
  onRetake: () => void;
  onPickAnother: () => void;
}) {
  const { correct, total, byCategory } = results;
  const acc = total ? Math.round((correct / total) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Exam results — {examSet === "random" ? "Random" : examSet}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="secondary">
            {correct} / {total} correct
          </Badge>
          <Badge className="font-semibold">{acc}% accuracy</Badge>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-semibold">By category</h3>
          <div className="space-y-2">
            {Object.entries(byCategory ?? {}).map(([cat, v]) => {
              const pct = v.total ? Math.round((v.correct / v.total) * 100) : 0;
              return (
                <div key={cat}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{cat}</span>
                    <span className="text-muted-foreground">
                      {v.correct}/{v.total} ({pct}%)
                    </span>
                  </div>
                  <Progress value={pct} />
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        {/* <Button onClick={() => onReview("wrong")}>Review mistakes !!!!</Button> */}
        <Button variant="outline" onClick={() => onReview("all")}>
          Review all
        </Button>
        <Button variant="outline" onClick={() => onReview("correct")}>
          Review correct
        </Button>
        <Button
          variant="outline"
          onClick={() => onReview("flagged")}
          disabled={!Object.values(flags).some(Boolean)}
        >
          Review flagged
        </Button>
        <div className="ml-auto flex gap-2">
          <Button onClick={onRetake}>Retake this exam</Button>
          <Button variant="secondary" onClick={onPickAnother}>
            Choose another set
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
