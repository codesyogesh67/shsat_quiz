"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function ReviewBackButton() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const from = searchParams.get("from");

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    if (from) {
      router.push(from);
      return;
    }

    router.push("/practice");
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleBack}
      className="shrink-0 rounded-xl text-slate-600 hover:bg-white/80 hover:text-slate-900"
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      Back
    </Button>
  );
}
