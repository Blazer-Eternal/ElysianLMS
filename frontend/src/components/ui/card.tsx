import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * The one surface in the system: warm border, no colored outlines,
 * no glass, no shadow by default (shadow only floats: toasts, menus).
 */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-card border border-line bg-surface",
        className
      )}
      {...props}
    />
  );
}

/** Card whose header carries a title and optional right-side action. */
export function CardHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-6",
        className
      )}
    >
      <div className="min-w-0">
        <h3 className="font-sans text-[15px] font-semibold leading-tight tracking-normal text-ink">
          {title}
        </h3>
        {subtitle ? (
          <p className="mt-0.5 text-[13px] text-ink-muted">{subtitle}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 py-5 sm:px-6", className)} {...props} />;
}
