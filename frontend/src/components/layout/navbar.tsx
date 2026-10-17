"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/features/auth/auth-provider";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/courses", label: "Catalog" },
  { href: "/about", label: "About" },
];

/**
 * Public-site chrome: solid (no blur tricks), compact, auth-aware.
 * Signed-in visitors get a direct route into the dashboard.
 */
export function Navbar() {
  const { user, status } = useAuth();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-10">
        <Link href="/" className="group inline-flex items-center gap-2.5">
          <span
            aria-hidden
            className="flex size-8 items-center justify-center rounded-md bg-pine font-display text-lg leading-none font-semibold text-paper transition-transform duration-150 group-hover:-translate-y-0.5"
          >
            E
          </span>
          <span className="font-display text-xl font-semibold tracking-tight text-ink">
            Elysian
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 sm:flex">
          {LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-(--radius-control) px-3 py-2 text-sm transition-colors",
                  active ? "text-ink" : "text-ink-muted hover:text-ink"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2.5">
          <ThemeToggle className="hidden md:inline-flex" />
          {user ? (
            <ButtonLink href="/dashboard" size="sm" iconEnd="arrow-right">
              Dashboard
            </ButtonLink>
          ) : status === "loading" ? (
            <span className="h-9 w-32 animate-pulse rounded-(--radius-control) bg-surface-muted" />
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-(--radius-control) px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface-muted sm:block"
              >
                Sign in
              </Link>
              <ButtonLink href="/register" size="sm">
                Create account
              </ButtonLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
