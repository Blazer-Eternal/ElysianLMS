import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Consistent page rhythm: one container width, one vertical spacing scale. */
export function PageContainer({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12", className)}
      {...props}
    />
  );
}

/**
 * Page head: mono eyebrow, Fraunces title, optional description and
 * right-aligned actions. Never stacked with a decorative badge pill.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-wrap items-end justify-between gap-x-8 gap-y-4", className)}>
      <div className="min-w-0 max-w-2xl">
        {eyebrow ? <p className="label pb-2">{eyebrow}</p> : null}
        <h1 className="font-display text-3xl font-semibold text-ink sm:text-[2.35rem]">
          {title}
        </h1>
        {description ? (
          <p className="mt-2.5 text-[15px] leading-6 text-ink-muted">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2.5">{actions}</div> : null}
    </header>
  );
}
