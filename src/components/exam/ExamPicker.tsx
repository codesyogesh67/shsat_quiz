"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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
import { startExam, getActive } from "@/lib/exams-client";

const SETS = [
  { key: "random", label: "Random (57Q / 90m)" },
  { key: "shsat_2018", label: "SHSAT 2018" },

  { key: "shsat_2019", label: "SHSAT 2019" },
  { key: "shsat_2020", label: "SHSAT 2020" },
  { key: "shsat_2021", label: "SHSAT 2021" },
  { key: "shsat_2022", label: "SHSAT 2022" },
  { key: "shsat_2023", label: "SHSAT 2023" },
  { key: "shsat_2024", label: "SHSAT 2024" },
] as const;

export default function ExamPicker({
  defaultSet = "random",
  defaultCount = 57,
  defaultMinutes = 90,
}: {
  defaultSet?: string;
  defaultCount?: number;
  defaultMinutes?: number;
}) {
  const router = useRouter();
  const [setKey, setSetKey] = React.useState(defaultSet);
  const [count, setCount] = React.useState(defaultCount);
  const [minutes, setMinutes] = React.useState(defaultMinutes);
  const [loading, setLoading] = React.useState(false);
  const [resumeId, setResumeId] = React.useState<string | null>(null);

  // Try to discover an active session (for signed-in users)
  React.useEffect(() => {
    getActive()
      .then((j) => setResumeId(j?.sessionId ?? null))
      .catch(() => {});
  }, []);

  const onStart = async () => {
    setLoading(true);
    try {
      // NOTE: backend currently uses examKey + minutes; if you want variable "count",
      // add it to /api/exams/start and handle it there.
      const res = await startExam(setKey === "random" ? undefined : setKey);
      // If you want to support custom minutes/count:
      // await startExam(setKey, { minutes, count })
      router.push(`/exam/${res.sessionId}`);
    } catch (e) {
      console.error(e);
      alert("Failed to start exam");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="space-y-2 sm:col-span-2">
        <Label>Exam set</Label>
        <Select value={setKey} onValueChange={setSetKey}>
          <SelectTrigger>
            <SelectValue placeholder="Choose set" />
          </SelectTrigger>
          <SelectContent>
            {SETS.map((s) => (
              <SelectItem key={s.key} value={s.key}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Minutes</Label>
        <Input
          type="number"
          min={10}
          max={180}
          value={minutes}
          onChange={(e) =>
            setMinutes(clamp(+e.target.value || defaultMinutes, 10, 180))
          }
        />
      </div>

      <div className="space-y-2">
        <Label>Questions</Label>
        <Input
          type="number"
          min={10}
          max={100}
          value={count}
          onChange={(e) =>
            setCount(clamp(+e.target.value || defaultCount, 10, 100))
          }
        />
        <p className="text-xs text-muted-foreground">
          (Tip: if you want this to affect the backend, we can extend
          <code className="px-1">/api/exams/start</code> to accept a{" "}
          <code>count</code>.)
        </p>
      </div>

      <div className="sm:col-span-2 flex items-end gap-2">
        <Button
          className="w-full sm:w-auto"
          onClick={onStart}
          disabled={loading}
        >
          {loading ? "Starting…" : "Start exam"}
        </Button>

        {resumeId && (
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => router.push(`/exam/${resumeId}`)}
            disabled={loading}
          >
            Continue active exam
          </Button>
        )}
      </div>
    </div>
  );
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}
