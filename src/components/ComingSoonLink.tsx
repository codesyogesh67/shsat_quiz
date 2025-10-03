// components/ComingSoonLink.tsx
"use client";

import { Clock } from "lucide-react";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

export default function ComingSoonLink({ label }: { label: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="text-sm font-medium cursor-not-allowed  hover:text-muted-foreground/80">
            {label}
          </span>
        </TooltipTrigger>
        <TooltipContent className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>Still working</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
