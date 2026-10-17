"use client";

import type { ReactNode } from "react";
import { ApiError } from "@/types/api";
import { Button } from "@/components/ui/button";
import { ErrorState, Skeleton } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

/**
 * Hairline stat band: mono numerals, divided cells, no floating boxes.
 * The single pattern all three dashboards use for headline numbers.
 */
export function StatStrip({
  items,
  className,
}: {
  items: Array<{ label: string; value: ReactNode; note?: string }>;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-3 lg:grid-cols-4",
        className
      )}
    >
      {items.map((item) => (
        <div key={item.label} className="bg-surface px-5 py-4">
          <p className="label">{item.label}</p>
          <p className="mt-1.5 font-mono text-2xl leading-none tabular-nums text-ink">
            {item.value}
          </p>
          {item.note ? (
            <p className="mt-1.5 text-[13px] text-ink-muted">{item.note}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

/** Query-in-flight skeleton shaped roughly like the real dashboard. */
export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-9 w-72" />
      </div>
      <Skeleton className="h-24 w-full" />
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-56 w-full" />
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  );
}

/** Shared failure panel with an explicit retry. */
export function DashboardError({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry: () => void;
}) {
  const message =
    error instanceof ApiError
      ? error.status === 403
        ? "You do not have access to this dashboard."
        : error.message
      : "Something went wrong while loading this dashboard.";

  return (
    <ErrorState
      title="Dashboard unavailable"
      description={message}
      action={
        <Button variant="secondary" size="sm" iconStart="refresh" onClick={onRetry}>
          Try again
        </Button>
      }
    />
  );
}
