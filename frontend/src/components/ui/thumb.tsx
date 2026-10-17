import { cn, initialsOf } from "@/lib/utils";

/**
 * Course thumbnail with graceful fallback: when an API-provided image
 * exists it is shown as-is; otherwise a typographic tile keeps the
 * layout intact (no broken images, no stock photography).
 */
export function Thumb({
  url,
  title,
  className,
  size = "md",
}: {
  url?: string | null;
  title: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const dimension =
    size === "sm" ? "size-10 text-base" : size === "lg" ? "size-20 text-3xl" : "size-14 text-2xl";

  if (url) {
    return (
      <img
        src={url}
        alt=""
        aria-hidden
        className={cn(
          "shrink-0 rounded-lg border border-line bg-surface-muted object-cover",
          dimension,
          className
        )}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg bg-pine-soft font-display font-semibold text-pine",
        dimension,
        className
      )}
    >
      {initialsOf(title)}
    </span>
  );
}
