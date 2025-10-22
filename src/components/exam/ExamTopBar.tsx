"use client";

import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Timer } from "lucide-react";

export default function ExamTopBar({
  examLabel,
  minutes,
  secondsLeft,
  timePct,
  answeredMeta,
  onExit,
  onSubmit,
}: {
  examLabel: string;
  minutes: number;
  secondsLeft: number;
  timePct: number;
  answeredMeta: string;
  onExit: () => void;
  onSubmit: () => Promise<void> | void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [expired, setExpired] = useState(false);

  // auto-submit when time runs out (visual only; controller also handles it)
  useEffect(() => {
    if (secondsLeft <= 0 && !expired) {
      setExpired(true);
      setTimeout(() => onSubmit(), 800);
    }
  }, [secondsLeft, expired, onSubmit]);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="space-y-3 px-6 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <Timer className="h-4 w-4" />
            <span className="font-mono tabular-nums">{fmt(secondsLeft)}</span>
            <div className="w-32">
              <Progress value={timePct} />
            </div>
            <span className="text-xs text-muted-foreground">
              ({minutes} min)
            </span>
            {expired && (
              <span className="ml-2 text-xs text-destructive">Time’s up!</span>
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            {examLabel} · {answeredMeta}
          </div>

          <div className="flex items-center gap-2">
            <ExitConfirm onConfirm={onExit} />
            <SubmitConfirm onConfirm={handleSubmit} submitting={submitting} />
          </div>
        </div>
      </div>
      <Separator className="mt-4" />
    </>
  );
}

function fmt(sec: number) {
  const m = Math.floor(Math.max(0, sec) / 60);
  const s = Math.max(0, sec) % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function ExitConfirm({ onConfirm }: { onConfirm: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          Exit
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Exit exam?</AlertDialogTitle>
          <AlertDialogDescription>
            Your progress will be lost unless you submit first.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Stay</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Exit</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function SubmitConfirm({
  onConfirm,
  submitting,
}: {
  onConfirm: () => void;
  submitting: boolean;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" disabled={submitting}>
          {submitting ? "Submitting…" : "Submit"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Submit answers?</AlertDialogTitle>
          <AlertDialogDescription>
            You won’t be able to change answers after submission.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep working</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Submit</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
