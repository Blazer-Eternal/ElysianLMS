"use client";

import { useTheme } from "@/components/providers/theme-provider";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", label: "Light", icon: "sun" as const },
  { value: "dark", label: "Dark", icon: "moon" as const },
  { value: "system", label: "System", icon: "monitor" as const },
] as const;

/**
 * Three-state preference as a segmented control (used in nav footers and
 * settings). Highlights the active choice with a solid fill.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Color theme"
      className={cn(
        "inline-flex rounded-(--radius-control) border border-line bg-surface p-0.5",
        className
      )}
    >
      {OPTIONS.map((option) => {
        const active = theme === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setTheme(option.value)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-widest transition-colors",
              active
                ? "bg-pine text-paper"
                : "text-ink-muted hover:bg-surface-muted hover:text-ink"
            )}
          >
            <Icon name={option.icon} size={13} />
            <span className="hidden sm:inline">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
