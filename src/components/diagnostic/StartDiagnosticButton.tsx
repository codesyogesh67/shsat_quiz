"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StartDiagnosticButton() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleStart() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/sessions/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: "diagnostic",
          count: 12,
          minutes: 20,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.ok || !data?.sessionId) {
        throw new Error(data?.error || "Could not start diagnostic");
      }

      router.push(`/session/${data.sessionId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <Button
        type="button"
        size="lg"
        className="rounded-xl border-0 bg-gradient-to-r from-indigo-600 to-violet-600 px-6 text-white shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5 hover:shadow-xl"
        onClick={handleStart}
        disabled={loading}
      >
        {loading ? "Starting..." : "Begin Diagnostic"}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
