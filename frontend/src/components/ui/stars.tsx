import { cn } from "@/lib/utils";

const STAR_PATH =
  "M12 3.8l2.5 5.2 5.7.8-4.1 4 1 5.7-5.1-2.7-5.1 2.7 1-5.7-4.1-4 5.7-.8z";

/** Read-only star row: filled amber for earned stars, outline for the rest. */
export function Stars({
  value,
  size = 14,
  className,
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  const rounded = Math.round(value);
  return (
    <span
      className={cn("inline-flex items-center gap-0.5 text-amber", className)}
      role="img"
      aria-label={`${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={star <= rounded ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinejoin="round"
          aria-hidden
        >
          <path d={STAR_PATH} />
        </svg>
      ))}
    </span>
  );
}

/**
 * Interactive picker for the review form. Buttons keep focus, announce
 * their value, and highlight the hover preview via group-hover fills.
 */
export function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Rating" className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star === 1 ? "" : "s"}`}
          onClick={() => onChange(star)}
          className="group rounded p-1 text-amber transition-transform hover:-translate-y-0.5"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill={star <= value ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinejoin="round"
            aria-hidden
          >
            <path d={STAR_PATH} />
          </svg>
        </button>
      ))}
      <span className="ml-2 font-mono text-[11px] uppercase tracking-widest text-ink-muted">
        {value > 0 ? `${value} of 5` : "pick a rating"}
      </span>
    </div>
  );
}
