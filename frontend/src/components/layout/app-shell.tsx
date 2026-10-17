"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/auth-provider";
import { NAV_SECTIONS } from "@/constants/nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

/** Wordmark: monogram tile + Fraunces name, used in every chrome. */
export function Wordmark({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-2.5">
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
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();

  const sections = NAV_SECTIONS.filter(
    (section) => !section.roles || (user ? section.roles.includes(user.role) : false)
  );

  return (
    <nav aria-label="Main" className="flex flex-col gap-6">
      {sections.map((section) => (
        <div key={section.label}>
          <p className="label px-3 pb-2">{section.label}</p>
          <ul className="flex flex-col gap-0.5">
            {section.items.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative flex items-center gap-3 rounded-(--radius-control) px-3 py-2 text-sm transition-colors",
                      active
                        ? "bg-pine-soft font-medium text-pine"
                        : "text-ink-muted hover:bg-surface-muted hover:text-ink"
                    )}
                  >
                    {active ? (
                      <span
                        aria-hidden
                        className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-pine"
                      />
                    ) : null}
                    <Icon name={item.icon} size={17} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/**
 * Authenticated chrome: fixed sidebar on desktop, top bar with a
 * slide-over drawer on small screens. Pages own their own padding.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  // Close the drawer whenever the route changes: NavList reports every
  // navigation, and the guard effect below still covers session death.
  useEffect(() => {
    if (status === "guest") {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [status, pathname, router]);

  return (
    <div className="min-h-dvh lg:pl-64">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-surface lg:flex">
        <div className="px-5 py-6">
          <Wordmark href="/dashboard" />
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-4">
          {status === "loading" ? (
            <div className="flex justify-center py-6">
              <Spinner />
            </div>
          ) : (
            <NavList />
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-line px-4 py-4">
          <ThemeToggle />
          <UserMenu />
        </div>
      </aside>

      {/* Mobile / tablet top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-paper px-4 py-3 lg:hidden">
        <Wordmark href="/dashboard" />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
            className="flex size-9 items-center justify-center rounded-(--radius-control) border border-line bg-surface text-ink transition-colors hover:border-line-strong"
          >
            <Icon name="menu" size={18} />
          </button>
          <UserMenu compact />
        </div>
      </header>

      <main id="main" className="min-h-dvh">
        {children}
      </main>

      {/* Slide-over drawer for small screens */}
      {open ? (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
        >
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink/40"
          />
          <div className="absolute inset-y-0 right-0 flex w-72 max-w-[85vw] flex-col border-l border-line bg-surface">
            <div className="flex items-center justify-between border-b border-line px-4 py-4">
              <span className="min-w-0">
                <span className="block truncate font-display text-lg font-semibold text-ink">
                  {user?.name ?? "Menu"}
                </span>
                <span className="label">{user?.role ?? ""}</span>
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close navigation"
                className="flex size-9 shrink-0 items-center justify-center rounded-(--radius-control) text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-4">
              <NavList onNavigate={() => setOpen(false)} />
            </div>

            <div className="border-t border-line px-4 py-4">
              <ThemeToggle className="w-full justify-center" />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
