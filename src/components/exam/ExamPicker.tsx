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
import {
  Clock,
  ListChecks,
  BookOpen,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [error, setError] = React.useState<string | null>(null);

  function isSetKey(v: string): v is SetKey {
    return SETS.some((s) => s.key === v);
  }

  const onStart = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/sessions/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: "exam",
          examKey: setKey === "random" ? undefined : setKey,
          count: DEFAULT_COUNT,
          minutes: DEFAULT_MINUTES,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.ok || !data?.sessionId) {
        throw new Error(data?.error || "Failed to start exam");
      }

      router.push(`/session/${data.sessionId}`);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Failed to start exam");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full">
      <Card className="overflow-hidden rounded-[28px] border border-slate-200/70 bg-white shadow-[0_20px_70px_-40px_rgba(79,70,229,0.35)]">
        <CardContent className="p-0">
          <div className="relative overflow-hidden border-b border-indigo-400/20 px-5 py-4 sm:px-6">
            <div className="absolute inset-0" />
            <div className="absolute -right-10 top-0 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -left-6 bottom-0 h-20 w-20 rounded-full bg-fuchsia-400/20 blur-2xl" />

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Icon + Title inline */}
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                    <BookOpen className="h-4.5 w-4.5" />
                  </span>

                  <h2 className="text-lg font-semibold tracking-tight sm:text-xl text-slate-900">
                    SHSAT Exam Old Questions
                  </h2>
                </div>

                {/* Tag closer + smaller */}
                <div className="ml-2 inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-indigo-600">
                  <Sparkles className="h-3 w-3" />
                  Full-Length Practice
                </div>
              </div>
            </div>

            {/* Subtitle tighter */}
            <p className="relative mt-1 text-sm text-slate-500">
              Choose a past set or start a random full-length exam session.
            </p>
          </div>

          <div className="p-4 sm:p-5">
            <div className="grid gap-3 xl:grid-cols-[minmax(260px,1.4fr)_minmax(140px,0.7fr)_minmax(140px,0.7fr)_minmax(140px,0.7fr)_auto]">
              <div className="rounded-[22px] border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-semibold text-slate-800">
                    Choose Exam Set
                  </p>
                </div>

                <Select
                  value={setKey}
                  onValueChange={(v) => {
                    if (isSetKey(v)) setSetKey(v);
                  }}
                >
                  <SelectTrigger
                    id="exam-set"
                    className="h-11 rounded-2xl border-slate-200 bg-white text-sm shadow-sm focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <SelectValue placeholder="Choose set" />
                  </SelectTrigger>

                  <SelectContent
                    className="z-[100] rounded-2xl border border-slate-200 bg-white shadow-xl"
                    position="popper"
                  >
                    {SETS.map((s) => (
                      <SelectItem
                        key={s.key}
                        value={s.key}
                        className="cursor-pointer rounded-lg focus:bg-indigo-600 focus:text-white data-[highlighted]:bg-indigo-600 data-[highlighted]:text-white"
                      >
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <SummaryItem
                icon={<ListChecks className="h-4 w-4" aria-hidden />}
                label="Questions"
                value={`${DEFAULT_COUNT}`}
                theme="indigo"
              />

              <SummaryItem
                icon={<Clock className="h-4 w-4" aria-hidden />}
                label="Time"
                value={`${DEFAULT_MINUTES} min`}
                theme="violet"
              />

              <SummaryItem
                icon={<Sparkles className="h-4 w-4" aria-hidden />}
                label="Mode"
                value="Full exam"
                theme="fuchsia"
              />

              <div className="flex items-stretch xl:justify-end">
                <Button
                  className={cn(
                    "h-full min-h-[88px] w-full rounded-[22px] bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-6 text-white shadow-[0_16px_36px_-18px_rgba(99,102,241,0.55)] transition-all duration-200 hover:opacity-95 xl:min-w-[170px]"
                  )}
                  onClick={onStart}
                  disabled={loading}
                >
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    {loading ? "Starting..." : "Start exam"}
                    {!loading && <ChevronRight className="h-4 w-4" />}
                  </span>
                </Button>
              </div>
            </div>

            {error ? (
              <p className="mt-3 text-sm text-destructive">{error}</p>
            ) : null}
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
  theme,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  theme: "indigo" | "violet" | "fuchsia";
}) {
  const styles = {
    indigo: {
      wrap:
        "border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-indigo-100/70",
      icon: "bg-indigo-100 text-indigo-700",
    },
    violet: {
      wrap:
        "border-violet-200 bg-gradient-to-br from-violet-50 via-white to-violet-100/70",
      icon: "bg-violet-100 text-violet-700",
    },
    fuchsia: {
      wrap:
        "border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 via-white to-rose-100/70",
      icon: "bg-fuchsia-100 text-fuchsia-700",
    },
  }[theme];

  return (
    <div
      className={cn(
        "flex min-h-[88px] items-center gap-3 rounded-[22px] border p-4 shadow-sm",
        styles.wrap
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl",
          styles.icon
        )}
      >
        {icon}
      </div>

      <div className="space-y-0.5">
        <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
          {label}
        </div>
        <div className="text-sm font-semibold text-slate-900">{value}</div>
      </div>
    </div>
  );
}
