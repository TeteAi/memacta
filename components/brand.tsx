import * as React from "react";
import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "text-brand-gradient font-black tracking-tight",
        className,
      )}
    >
      memacta
    </span>
  );
}
