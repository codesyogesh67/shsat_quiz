"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type RetakeSessionButtonProps = {
  sessionId: string;
  className?: string;
  iconOnly?: boolean;
};

export default function RetakeSessionButton({
  sessionId,
  className,
  iconOnly = false,
}: RetakeSessionButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRetake() {
    if (loading) return;

    try {
      setLoading(true);

      const res = await fetch(`/api/sessions/${sessionId}/retake`, {
        method: "POST",
      });

      const data = (await res.json()) as {
        ok?: boolean;
        redirectTo?: string;
        error?: string;
      };

      if (!res.ok || !data.redirectTo) {
        throw new Error(data.error || "Failed to start retake");
      }

      router.push(data.redirectTo);
      router.refresh();
    } catch (error) {
      console.error("Retake failed:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to start retake session."
      );
    } finally {
      setLoading(false);
    }
  }

  if (iconOnly) {
    return (
      <Button
        type="button"
        onClick={handleRetake}
        disabled={loading}
        className={cn(
          "app-icon-square rounded-xl bg-gradient-to-r from-indigo-600 via-violet-500 to-fuchsia-500 text-white shadow-[0_10px_20px_rgba(99,102,241,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70",
          className
        )}
        aria-label="Retake"
        title="Retake"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      type="button"
      onClick={handleRetake}
      disabled={loading}
      className={cn(
        "rounded-xl bg-gradient-to-r from-indigo-600 via-violet-500 to-fuchsia-500 text-white shadow-[0_10px_20px_rgba(99,102,241,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70",
        className
      )}
    >
      <RotateCcw className="mr-2 h-4 w-4" />
      {loading ? "Starting..." : "Retake"}
    </Button>
  );
}
