"use client";

import { useAuth } from "@/features/auth/auth-provider";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { Monogram } from "@/components/layout/user-menu";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/primitives";

/**
 * Identity page. The backend has no profile-update endpoint, so this is
 * deliberately read-only and says so instead of showing dead controls.
 */
export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Account"
        title="Profile"
        description="Who you are on Elysian. These details come from your registration record."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card>
          <div className="flex items-center gap-5 border-b border-line px-5 py-6 sm:px-6">
            <Monogram name={user.name} size={64} />
            <div className="min-w-0">
              <h2 className="font-display text-2xl font-semibold text-ink">{user.name}</h2>
              <p className="mt-0.5 truncate text-[15px] text-ink-muted">{user.email}</p>
              <div className="mt-2.5 flex items-center gap-2">
                <Badge tone={user.role === "admin" ? "info" : "positive"}>{user.role}</Badge>
                <span className="font-mono text-[11px] uppercase tracking-widest  text-ink-muted">
                  id {user.id}
                </span>
              </div>
            </div>
          </div>

          <dl className="px-5 py-5 sm:px-6">
            {[
              ["Full name", user.name],
              ["Email", user.email],
              ["Role", user.role],
              ["Account id", String(user.id)],
            ].map(([term, value], index) => (
              <div
                key={term}
                className={
                  "flex items-baseline justify-between gap-6 py-3 " +
                  (index === 0 ? "" : "border-t border-line")
                }
              >
                <dt className="label">{term}</dt>
                <dd className="truncate text-right text-sm text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader title="Need a change?" />
            <div className="px-5 py-5 sm:px-6">
              <p className="text-sm leading-6 text-ink-muted">
                Name and email are fixed at registration in this build. To
                correct them, contact an administrator. Your password can be
                changed yourself from Settings.
              </p>
              <ButtonLink
                href="/settings"
                variant="secondary"
                size="sm"
                iconEnd="arrow-right"
                className="mt-4"
              >
                Open Settings
              </ButtonLink>
            </div>
          </Card>

          <Card>
            <CardHeader title="Sessions" />
            <div className="px-5 py-5 sm:px-6">
              <p className="text-sm leading-6 text-ink-muted">
                Access tokens last 15 minutes and renew silently while you
                work. Changing your password signs every session out, and
                signing out ends this one immediately.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
