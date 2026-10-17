"use client";

import { useMemo, useState } from "react";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { Badge, ErrorState, Skeleton } from "@/components/ui/primitives";
import { CONTROL_CLASSES } from "@/components/ui/field";
import { ConfirmAction } from "@/features/teaching/confirm";
import { Select } from "@/features/teaching/select";
import { AdminGate } from "@/features/admin/admin-gate";
import { useAdminUsers } from "@/features/admin/queries";
import { useUserMutations } from "@/features/admin/mutations";
import { useAuth } from "@/features/auth/auth-provider";
import { toApiError } from "@/lib/api-client";
import { cn, formatDate, initialsOf } from "@/lib/utils";
import type { Role } from "@/types/auth";

const ROLE_OPTIONS: Array<{ value: Role; label: string }> = [
  { value: "student", label: "Student" },
  { value: "teacher", label: "Teacher" },
  { value: "admin", label: "Admin" },
];

/**
 * User administration: role assignment (which gates teaching/admin
 * surfaces) and deletion. The API has no ban endpoint, so `isBanned`
 * is displayed as a read-only fact rather than a fake control.
 */
export default function AdminUsersPage() {
  const { user } = useAuth();
  const query = useAdminUsers();
  const mutations = useUserMutations();
  const [filter, setFilter] = useState("");

  const visible = useMemo(() => {
    const users = query.data ?? [];
    const needle = filter.trim().toLowerCase();
    if (!needle) return users;
    return users.filter(
      (candidate) =>
        candidate.name.toLowerCase().includes(needle) ||
        candidate.email.toLowerCase().includes(needle)
    );
  }, [query.data, filter]);

  return (
    <PageContainer>
      <AdminGate>
        <PageHeader
          eyebrow="Admin"
          title="Users"
          description="Roles decide who reaches the teaching workspace and this area. The API has no ban endpoint; deletion only succeeds for accounts the database lets go (no orders, courses, or enrollments)."
        />

        {/* Filter */}
        <div className="mt-6 max-w-sm">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-ink">Find a user</span>
            <input
              type="search"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              placeholder="Name or email…"
              className={cn(CONTROL_CLASSES, "h-10")}
            />
          </label>
        </div>

        {/* States */}
        {query.isLoading ? (
          <div className="mt-6 flex flex-col gap-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : query.isError || !query.data ? (
          <div className="mt-6">
            <ErrorState
              title={toApiError(query.error).status === 403 ? "Admins only" : "Users unavailable"}
              description={toApiError(query.error).message}
              action={
                <button
                  type="button"
                  onClick={() => query.refetch()}
                  className="link-underline text-sm text-pine"
                >
                  Try again
                </button>
              }
            />
          </div>
        ) : visible.length === 0 ? (
          <p className="mt-6 rounded-card) border border-dashed border-line-strong px-4 py-8 text-center text-sm text-ink-muted">
            No user matches “{filter.trim()}”.
          </p>
        ) : (
          <ul className="mt-6 overflow-hidden rounded-card border border-line bg-surface">
            {visible.map((member, index) => {
              const isSelf = member.id === user?.id;
              const rolePending =
                mutations.assignRole.isPending && mutations.assignRole.variables?.id === member.id;

              return (
                <li
                  key={member.id}
                  className={cn(
                    "flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3.5 sm:px-5",
                    index > 0 && "border-t border-line"
                  )}
                >
                  <span
                    aria-hidden
                    className="flex size-9 shrink-0 items-center justify-center rounded-full bg-pine-soft font-mono text-xs font-medium text-pine"
                  >
                    {initialsOf(member.name)}
                  </span>

                  <span className="min-w-0 flex-1 basis-52">
                    <span className="block truncate text-sm font-medium text-ink">
                      {member.name}
                      {isSelf ? (
                        <span className="ml-2 font-mono text-[10px] uppercase tracking-widest text-ink-muted">
                          you
                        </span>
                      ) : null}
                    </span>
                    <span className="block truncate text-[13px] text-ink-muted">
                      {member.email}
                    </span>
                  </span>

                  <span className="font-mono text-[11px] text-ink-muted">
                    #{member.id} · joined {formatDate(member.createdAt)}
                  </span>

                  {member.isBanned ? (
                    <Badge tone="negative">banned</Badge>
                  ) : null}

                  <span className="w-36">
                    <Select
                      label="Role"
                      aria-label={`Role for ${member.name}`}
                      value={member.role}
                      disabled={isSelf || rolePending}
                      title={isSelf ? "You cannot change your own role" : undefined}
                      onChange={(event) =>
                        mutations.assignRole.mutate({
                          id: member.id,
                          role: event.target.value as Role,
                        })
                      }
                    >
                      {ROLE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </span>

                  <ConfirmAction
                    label="Delete"
                    confirmLabel="Delete user"
                    disabled={isSelf}
                    onConfirm={() => mutations.deleteUser.mutateAsync(member.id)}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </AdminGate>
    </PageContainer>
  );
}
