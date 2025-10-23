"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
// If you use shadcn/ui Slider:
import { Slider } from "@/components/ui/slider";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function toInt(v: unknown, d: number) {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

export default function RandomConfigurator() {
  const router = useRouter();
  const [count, setCount] = React.useState<number>(57);
  const [minutes, setMinutes] = React.useState<number>(90);

  const handleMinutesChange = (vals: number[]) => {
    setMinutes(clamp(vals[0] ?? 90, 5, 240));
  };

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const c = clamp(toInt(count, 57), 1, 2000);
    const m = clamp(toInt(minutes, 90), 5, 240);
    router.push(`/practice/random?count=${c}&minutes=${m}`);
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-6">
      {/* Question count */}
      <div className="grid gap-2">
        <Label htmlFor="count">Question count</Label>
        <div className="flex items-center gap-3">
          <Input
            id="count"
            type="number"
            min={1}
            max={2000}
            inputMode="numeric"
            value={count}
            onChange={(e) => setCount(toInt(e.target.value, count))}
            className="max-w-[200px]"
          />
          <span className="text-xs text-muted-foreground">
            Full SHSAT set is typically 57.
          </span>
        </div>
      </div>

      {/* Minutes (Slider + numeric input) */}
      <div className="grid gap-2">
        <Label htmlFor="minutes">Time (minutes)</Label>
        <div className="grid gap-3">
          <Slider
            id="minutes"
            value={[minutes]}
            onValueChange={handleMinutesChange}
            min={5}
            max={240}
            step={5}
            className="w-full"
          />
          <div className="mt-2 flex items-center gap-3">
            <Input
              type="number"
              min={5}
              max={240}
              step={5}
              inputMode="numeric"
              value={minutes}
              onChange={(e) =>
                setMinutes(clamp(toInt(e.target.value, minutes), 5, 240))
              }
              className="max-w-[160px]"
            />
            <span className="text-sm text-muted-foreground">
              {Math.floor(minutes / 60)}h {minutes % 60}m
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end">
        <Button type="submit">Start Practice</Button>
      </div>
    </form>
  );
}
