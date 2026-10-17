import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Icon, type IconName } from "@/components/ui/icon";

/* ------------------------------- Badge ------------------------------- */

type BadgeTone = "neutral" | "positive" | "attention" | "negative" | "info";

const BADGE_TONES: Record<BadgeTone, string> = {
  neutral: "border-line-strong bg-surface-muted text-ink-muted",
  positive: "border-pine/35 bg-pine-soft text-pine",
  attention: "border-amber/40 bg-amber-soft text-amber",
  negative: "border-clay/35 bg-clay-soft text-clay",
  info: "border-line-strong bg-surface text-ink",
};

/**
 * Status chip: mono small-caps, quiet fills. Used for course/order states
 * and counts, never as decoration above headlines.
 */
export function Badge({
  tone = "neutral",
  className,
  children,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-medium uppercase tracking-[0.08em]",
        BADGE_TONES[tone],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

/* ------------------------------ Spinner ------------------------------ */

export function Spinner({
  size = 18,
  className,
  label,
}: {
  size?: number;
  className?: string;
  label?: string;
}) {
  return (
    <span
      className={cn("inline-flex items-center gap-2 text-ink-muted", className)}
      role={label ? "status" : undefined}
    >
      <span
        className="animate-spin rounded-full border-[1.5px] border-line-strong border-t-pine"
        style={{ width: size, height: size }}
        aria-hidden
      />
      {label ? <span className="text-sm">{label}</span> : null}
    </span>
  );
}

/** Centered block for any query in flight. */
export function LoadingBlock({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-40 items-center justify-center">
      <Spinner label={label} />
    </div>
  );
}

/* ---------------------------- Empty / error --------------------------- */

export function EmptyState({
  icon = "inbox",
  title,
  description,
  action,
  className,
}: {
  icon?: IconName;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-card border border-dashed border-line-strong px-6 py-12 text-center",
        className
      )}
    >
      <span className="flex size-10 items-center justify-center rounded-full bg-surface-muted text-ink-muted">
        <Icon name={icon} size={20} />
      </span>
      <p className="mt-1 font-display text-lg text-ink">{title}</p>
      {description ? (
        <p className="max-w-sm text-sm leading-6 text-ink-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description,
  action,
  className,
}: {
  title?: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-start gap-2 rounded-card border border-clay/35 bg-clay-soft px-5 py-4",
        className
      )}
    >
      <p className="flex items-center gap-2 text-sm font-medium text-clay">
        <Icon name="alert" size={16} />
        {title}
      </p>
      {description ? <p className="text-sm leading-6 text-ink">{description}</p> : null}
      {action}
    </div>
  );
}

/** Inline form-level message (rate limits, server rejects, generic failures). */
export function FormAlert({ message, className }: { message: string; className?: string }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className={cn(
        "flex items-start gap-2 rounded-(--radius-control) border border-clay/35 bg-clay-soft px-3.5 py-2.5 text-sm leading-5 text-clay",
        className
      )}
    >
      <Icon name="alert" size={16} className="mt-0.5" />
      <span>{message}</span>
    </p>
  );
}

/* ------------------------------ Progress ------------------------------ */

/** Course progress: ruled track, pine fill, exact percentage in mono. */
export function ProgressBar({
  value,
  className,
  showLabel = false,
}: {
  value: number;
  className?: string;
  showLabel?: boolean;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-muted"
      >
        <div
          className="h-full rounded-full bg-pine transition-[width] duration-500 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className="w-10 shrink-0 text-right font-mono text-xs tabular-nums text-ink-muted">
        {clamped}%
      </span>
      {showLabel ? null : null}
    </div>
  );
}

/* ------------------------------ Skeleton ------------------------------ */

/** Content-shaped loading placeholder (flat tint, no shimmer gradient). */
export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn("animate-pulse rounded-md bg-surface-muted", className)}
      {...props}
    />
  );
}
