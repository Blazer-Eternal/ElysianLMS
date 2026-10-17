"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/auth-provider";
import { Icon } from "@/components/ui/icon";
import { Wordmark } from "@/components/layout/app-shell";

/**
 * Route guard for the authenticated area.
 *  loading  → boot skeleton (session restore in flight)
 *  guest    → redirect to /login carrying the intended destination
 *  ready    → render the tree
 *
 * A session that dies later (refresh token expired) is caught both here
 * and by AppShell's own effect, so deep pages cannot hang signed out.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status !== "guest") return;
    const search = typeof window === "undefined" ? "" : window.location.search;
    router.replace(`/login?next=${encodeURIComponent(pathname + search)}`);
  }, [status, pathname, router]);

  if (status !== "authenticated") {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-paper">
        <Wordmark />
        <span className="flex items-center gap-2.5 text-sm text-ink-muted">
          <Icon name="loader" size={16} className="animate-spin" />
          Restoring your session
        </span>
      </div>
    );
  }

  return <>{children}</>;
}
