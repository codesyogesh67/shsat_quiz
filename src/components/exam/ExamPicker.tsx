"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { startExam, getActive } from "@/lib/exams-client";
import { Clock, ListChecks, BookOpen } from "lucide-react";

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

type SetKey = typeof SETS[number]["key"];

const DEFAULT_COUNT = 57;
const DEFAULT_MINUTES = 90;

export default function ExamPicker({
  defaultSet = "random",
}: {
  defaultSet?: SetKey;
}) {
  const router = useRouter();
  const [setKey, setSetKey] = React.useState<SetKey>(defaultSet);
  const [loading, setLoading] = React.useState(false);
  const [resumeId, setResumeId] = React.useState<string | null>(null);

  React.useEffect(() => {
    getActive()
      .then((j) => setResumeId(j?.sessionId ?? null))
      .catch(() => {});
  }, []);

  // Narrow string -> SetKey safely
  function isSetKey(v: string): v is SetKey {
    return SETS.some((s) => s.key === v);
  }

  const onStart = async () => {
    setLoading(true);
    try {
      const res = await startExam(setKey === "random" ? undefined : setKey);
      router.push(`/exam/${res.sessionId}`);
    } catch (e) {
      console.error(e);
      alert("Failed to start exam");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <Card className="shadow-sm">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="exam-set">Exam set</Label>
            <Select
              value={setKey}
              onValueChange={(v) => {
                if (isSetKey(v)) setSetKey(v);
              }}
            >
              <SelectTrigger id="exam-set">
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

          <Separator />

          <div className="grid gap-4 sm:grid-cols-3">
            <SummaryItem
              icon={<ListChecks className="h-4 w-4" aria-hidden />}
              label="Questions"
              value={`${DEFAULT_COUNT}`}
            />
            <SummaryItem
              icon={<Clock className="h-4 w-4" aria-hidden />}
              label="Time limit"
              value={`${DEFAULT_MINUTES} min`}
            />
            <SummaryItem
              icon={<BookOpen className="h-4 w-4" aria-hidden />}
              label="Mode"
              value="Full exam"
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              className="w-full sm:w-auto"
              onClick={onStart}
              disabled={loading}
            >
              {loading ? "Starting…" : "Start exam"}
            </Button>

            {/* {resumeId && (
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => router.push(`/exam/${resumeId}`)}
                disabled={loading}
              >
                Continue active exam
              </Button>
            )} */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
      <div className="rounded-md border p-2">{icon}</div>
      <div className="space-y-0.5">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}
