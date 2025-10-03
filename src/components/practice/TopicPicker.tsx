// components/practice/TopicPicker.tsx
"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type Counts = Record<string, number>;

export default function TopicPicker({
  defaultCount = 10,
  onStart,
}: {
  defaultCount?: number;
  onStart: (category: string, count: number) => void;
}) {
  const [counts, setCounts] = React.useState<Counts>({});
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [category, setCategory] = React.useState<string>("");
  const [count, setCount] = React.useState<number>(defaultCount);

  React.useEffect(() => {
    let ignore = false;
    setLoading(true);
    fetch("/api/category-counts")
      .then((r) => r.json())
      .then((j) => !ignore && setCounts(j?.counts ?? {}))
      .catch(
        (e) => !ignore && setError(e?.message ?? "Failed to load categories")
      )
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, []);

  const options = Object.entries(counts)
    .sort((a, b) => b[1] - a[1]) // most questions first
    .map(([k, n]) => ({ key: k, n }));

  const disabled = !category || count < 1;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="topic">Topic</Label>
        <Select
          value={category}
          onValueChange={setCategory}
          disabled={loading || !!error || options.length === 0}
        >
          <SelectTrigger id="topic">
            <SelectValue
              placeholder={loading ? "Loading…" : "Choose a topic"}
            />
          </SelectTrigger>
          <SelectContent>
            {options.map(({ key, n }) => (
              <SelectItem key={key} value={key}>
                <div className="flex items-center justify-between gap-3">
                  <span>{key}</span>
                  <Badge variant="secondary">{n} Qs</Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="count">Number of questions</Label>
        <Input
          id="count"
          type="number"
          min={1}
          max={60}
          value={count}
          onChange={(e) =>
            setCount(Math.max(1, Math.min(60, Number(e.target.value) || 10)))
          }
        />
        <p className="text-xs text-muted-foreground">
          Tip: 10–15 is great for focused drills.
        </p>
      </div>

      <div className="sm:col-span-2">
        <Button
          className="w-full"
          onClick={() => onStart(category, count)}
          disabled={disabled}
        >
          Start practice
        </Button>
      </div>

      {/* Quick picks */}
      {options.length > 0 && (
        <div className="sm:col-span-2">
          <div className="mt-2 text-xs font-semibold">Quick picks</div>
          <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">
            {options.slice(0, 4).map(({ key, n }) => (
              <Button
                key={key}
                variant="outline"
                onClick={() => onStart(key, Math.min(10, n))}
                className="justify-between"
              >
                <span>{key}</span>
                <Badge variant="secondary">{n}</Badge>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
