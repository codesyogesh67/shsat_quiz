// components/practice/QuestionView.tsx
"use client";

import * as React from "react";
import { Question } from "./PracticeShell";
import Image from "next/image";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import MediaRenderer from "@/components/MediaRenderer";

export default function QuestionView({
  mode = "test",
  question,
  value,
  onChange,
  onClear,
  onFlag,
  correctAnswer,
  userAnswer,
}: {
  mode?: "test" | "review";
  question: Question;
  value: string;
  onChange: (val: string) => void;
  onClear: () => void;
  onFlag: () => void;
  correctAnswer?: string;
  userAnswer?: string;
}) {
  const isReview = mode === "review";

  return (
    <div className="space-y-4">
      {/* Stem */}
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <div dangerouslySetInnerHTML={{ __html: question.stem }} />
      </div>

      {/* Media */}
      {question.media && question.media.type === "image" && (
        <div className="relative mx-auto aspect-video w-full max-w-xl overflow-hidden rounded-md border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {/* <img
            src={question.media.url}
            alt={question.media.alt ?? question.id}
            className="h-full w-full object-contain"
          /> */}
          <MediaRenderer media={question.media} />
        </div>
      )}

      {/* Answer controls */}
      {question.type === "MULTIPLE_CHOICE" ? (
        isReview ? (
          <div className="space-y-2">
            <div className="grid grid-cols-1 gap-2">
              {question.choices?.map((c) => {
                const isGold =
                  normalize(c.key) === normalize(correctAnswer ?? "");
                const isUser = normalize(c.key) === normalize(userAnswer ?? "");
                const ok = isGold;
                const wrongPick = isUser && !isGold;

                const cls =
                  "flex items-center gap-3 rounded-md border p-3 " +
                  (ok
                    ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30"
                    : wrongPick
                    ? "border-destructive/50 bg-destructive/10"
                    : "bg-muted/50");

                return (
                  <div key={c.key} className={cls}>
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-muted font-semibold">
                      {c.key}
                    </span>
                    <span className="text-sm">{c.text}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {ok ? "Correct" : wrongPick ? "Your choice" : ""}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="text-xs text-muted-foreground">
              Your answer:{" "}
              <span className="font-medium">{userAnswer ?? "—"}</span> · Correct
              answer:{" "}
              <span className="font-medium">{correctAnswer ?? "—"}</span>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <RadioGroup value={value} onValueChange={onChange}>
              <div className="grid grid-cols-1 gap-2">
                {question.choices?.map((c, i) => (
                  <label
                    key={c.key}
                    htmlFor={`choice-${c.key}`}
                    className="flex cursor-pointer items-center gap-3 rounded-md border p-3 hover:bg-muted"
                  >
                    <RadioGroupItem id={`choice-${c.key}`} value={c.key} />
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-muted font-semibold">
                      {c.key}
                    </span>
                    <span className="text-sm">{c.text}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      ({i + 1})
                    </span>
                  </label>
                ))}
              </div>
            </RadioGroup>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onClear}
                disabled={!value}
              >
                Clear answer
              </Button>
              <Button variant="secondary" size="sm" onClick={onFlag}>
                Mark for review
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Tip: use 1–8 or A–H keys to select.
            </p>
          </div>
        )
      ) : // FREE_RESPONSE
      isReview ? (
        <div className="space-y-2">
          <div
            className={
              "inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm " +
              (equalsNum(userAnswer, correctAnswer)
                ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30"
                : "border-destructive/50 bg-destructive/10")
            }
          >
            <span>Your answer:</span>
            <span className="font-medium">{userAnswer ?? "—"}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Correct answer:{" "}
            <span className="font-medium">{correctAnswer ?? "—"}</span>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              value={value ?? ""}
              onChange={(e) => onChange(e.target.value)}
              className="w-40 rounded-md border bg-background px-3 py-2 text-sm outline-none ring-0"
              placeholder="Enter number"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={onClear}
              disabled={!value}
            >
              Clear
            </Button>
            <Button variant="secondary" size="sm" onClick={onFlag}>
              Mark for review
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Press Enter to confirm.
          </p>
        </div>
      )}
    </div>
  );
}

function normalize(s: string) {
  return String(s ?? "")
    .trim()
    .toUpperCase();
}
function equalsNum(a?: string, b?: string) {
  if (a == null || b == null) return false;
  const na = Number(String(a).trim());
  const nb = Number(String(b).trim());
  return Number.isFinite(na) && Number.isFinite(nb) && na === nb;
}
