import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Icon, type IconName } from "@/components/ui/icon";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "quiet";
type Size = "sm" | "md" | "lg";

/**
 * Interaction model: solid color swaps and a 1px lift, never opacity fades.
 * Disabled state is visible (muted fill + no lift) and unreachable by hover.
 * Classes are shared between <Button> (button element) and <ButtonLink>
 * (Next Link) so navigation and actions never nest interactive elements.
 */
const VARIANT_CLASSES: Record<Variant, string> = {
  // Pine on paper: the single loudest control on a page.
  primary:
    "bg-pine text-paper border border-pine hover:bg-pine-deep hover:border-pine-deep active:translate-y-0",
  secondary:
    "bg-surface text-ink border border-line-strong hover:bg-surface-muted hover:border-ink-muted active:translate-y-0",
  ghost:
    "bg-transparent text-ink border border-transparent hover:bg-surface-muted active:translate-y-0",
  danger:
    "bg-clay text-paper border border-clay hover:bg-[color-mix(in_srgb,var(--clay)_85%,black)] active:translate-y-0",
  quiet:
    "bg-transparent text-ink-muted border border-line hover:text-ink hover:border-line-strong active:translate-y-0",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-12 px-6 text-[15px] gap-2",
};

const ICON_SIZE: Record<Size, number> = { sm: 15, md: 17, lg: 18 };

function buttonClasses({ variant, size, className }: { variant: Variant; size: Size; className?: string }) {
  return cn(
    "inline-flex select-none items-center justify-center rounded-[var(--radius-control)] font-medium",
    "transition-[transform,background-color,border-color,color] duration-150 ease-out",
    "hover:-translate-y-px active:translate-y-0",
    "disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-55",
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    className
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Icon rendered before the label. */
  iconStart?: IconName;
  /** Icon rendered after the label. */
  iconEnd?: IconName;
  /** Shows a spinner and blocks interaction. */
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    iconStart,
    iconEnd,
    loading = false,
    disabled,
    className,
    children,
    type = "button",
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={buttonClasses({ variant, size, className })}
      {...props}
    >
      {loading ? (
        <span
          className="size-3.75 shrink-0 animate-spin rounded-full border-[1.5px] border-current border-t-transparent"
          aria-hidden
        />
      ) : iconStart ? (
        <Icon name={iconStart} size={ICON_SIZE[size]} />
      ) : null}
      {children}
      {iconEnd && !loading ? <Icon name={iconEnd} size={ICON_SIZE[size]} /> : null}
    </button>
  );
});

/** Full-width variant for narrow form columns. */
export function ButtonBlock(props: ButtonProps) {
  return <Button {...props} className={cn("w-full", props.className)} />;
}

export interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: Variant;
  size?: Size;
  iconStart?: IconName;
  iconEnd?: IconName;
}

/** Navigation styled exactly like a Button: one focus stop, valid HTML. */
export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  iconStart,
  iconEnd,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={buttonClasses({ variant, size, className })}
      {...props}
    >
      {iconStart ? <Icon name={iconStart} size={ICON_SIZE[size]} /> : null}
      {children}
      {iconEnd ? <Icon name={iconEnd} size={ICON_SIZE[size]} /> : null}
    </Link>
  );
}

/** Full-width variant for narrow form columns. */
export function ButtonLinkBlock(props: ButtonLinkProps) {
  return <ButtonLink {...props} className={cn("w-full", props.className)} />;
}
