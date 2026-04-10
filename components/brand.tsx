import * as React from "react";
import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "bg-brand-gradient bg-clip-text text-transparent font-black tracking-tight",
        className,
      )}
    >
      memacta
    </span>
  );
}
