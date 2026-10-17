"use client";

import type { ReactNode } from "react";
import { ErrorState } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-provider";

/**
 * Client-side admin gate. The API enforces the same rule server-side;
 * this only skips a doomed request and gives an instant, honest answer
 * for accounts that wander into /admin by URL.
 */
export function AdminGate({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  if (user && user.role !== "admin") {
    return (
      <ErrorState
        title="Admins only"
        description="Your account does not carry the admin role. Ask an admin if you need access — the dashboard stays open in the meantime."
        action={
          <ButtonLink href="/dashboard" variant="secondary" size="sm" iconStart="chevron-left">
            Back to dashboard
          </ButtonLink>
        }
      />
    );
  }

  return children;
}
