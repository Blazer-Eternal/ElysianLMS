"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/button";

/**
 * Root error boundary. Shows the real message during development
 * (the digest line stays for production reports) and always offers a
 * retry that re-renders the failed subtree.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-16 text-center">
      <div className="w-full max-w-md">
        <p className="label">Application error</p>
        <h1 className="mt-6 font-display text-3xl font-semibold text-ink">
          Something broke on this page
        </h1>
        <p className="mt-3 text-[15px] leading-7 text-ink-muted">
          The rest of the site is likely fine — retry, or go back to the dashboard.
        </p>

        <p className="mt-4 rounded-(--radius-control) bg-surface-muted px-3 py-2 font-mono text-[12px] wrap-break-word text-ink-muted">
          {error.message || "Unknown error"}
          {error.digest ? ` · ref ${error.digest}` : ""}
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button onClick={reset}>Try again</Button>
          <ButtonLink href="/dashboard" variant="secondary">
            Back to dashboard
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}

