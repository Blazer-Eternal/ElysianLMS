"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/auth-provider";
import { Icon } from "@/components/ui/icon";
import { cn, initialsOf } from "@/lib/utils";

/**
 * Signed-in identity block. Click opens a menu (profile, settings, sign
 * out); Escape and outside clicks close it. The monogram avatar is drawn
 * from the name, so no image hosting is needed.
 */
export function UserMenu({ compact = false }: { compact?: boolean }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!user) return null;

  const handleSignOut = async () => {
    setOpen(false);
    await logout();
    router.replace("/login");
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "flex items-center gap-2.5 rounded-(--radius-control) border border-line bg-surface py-1.5 transition-colors hover:border-line-strong",
          compact ? "pl-1.5 pr-2" : "pl-1.5 pr-3"
        )}
      >
        <Monogram name={user.name} />
        {!compact ? (
          <span className="hidden text-left leading-tight sm:block">
            <span className="block max-w-32 truncate text-sm font-medium text-ink">
              {user.name}
            </span>
            <span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
              {user.role}
            </span>
          </span>
        ) : null}
        <Icon name="chevron-down" size={14} className="text-ink-muted" />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Account menu"
          className="absolute right-0 top-[calc(100%+6px)] z-40 w-56 rounded-card border border-line bg-surface p-1.5 shadow-[0_12px_32px_rgba(27,27,23,0.14)]"
        >
          <div className="border-b border-line px-3 py-2.5">
            <p className="truncate text-sm font-medium text-ink">{user.name}</p>
            <p className="truncate text-[13px] text-ink-muted">{user.email}</p>
          </div>

          <MenuLink href="/profile" onNavigate={() => setOpen(false)} icon="user">
            Profile
          </MenuLink>
          <MenuLink href="/settings" onNavigate={() => setOpen(false)} icon="sliders">
            Settings
          </MenuLink>

          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            className="mt-1 flex w-full items-center gap-2.5 border-t border-line px-3 py-2.5 text-left text-sm text-clay transition-colors hover:bg-clay-soft"
          >
            <Icon name="logout" size={16} />
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}

function MenuLink({
  href,
  icon,
  onNavigate,
  children,
}: {
  href: string;
  icon: "user" | "sliders";
  onNavigate: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onNavigate}
      className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm text-ink transition-colors hover:bg-surface-muted"
    >
      <Icon name={icon} size={16} className="text-ink-muted" />
      {children}
    </Link>
  );
}

/** Initials avatar, deterministic warm tint from the name. */
export function Monogram({ name, size = 32 }: { name: string; size?: number }) {
  return (
    <span
      aria-hidden
      className="flex shrink-0 items-center justify-center rounded-full bg-pine font-mono font-medium text-paper"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
    >
      {initialsOf(name)}
    </span>
  );
}
