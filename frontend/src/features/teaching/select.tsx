"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Label-above select matching the field kit: same control treatment,
 * same hint line. Native select on purpose — keyboard and screen
 * reader behavior comes for free.
 */
export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & { label: string; hint?: string }
>(function Select({ label, hint, className, children, ...props }, ref) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-ink">{label}</span>
      <select
        ref={ref}
        className={cn(
          "h-11 w-full rounded-(--radius-control) border border-line bg-surface px-3.5 text-[15px] text-ink",
          "transition-colors duration-150 hover:border-line-strong focus:border-pine focus:outline-none",
          "disabled:bg-surface-muted disabled:text-ink-muted",
          className
        )}
        {...props}
      >
        {children}
      </select>
      {hint ? (
        <span className="text-[13px] leading-5 text-ink-muted">{hint}</span>
      ) : null}
    </label>
  );
});
