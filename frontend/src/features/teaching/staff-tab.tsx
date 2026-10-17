"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/primitives";
import { ConfirmIcon } from "@/features/teaching/confirm";
import { Select } from "@/features/teaching/select";
import { useStaffMutations } from "@/features/teaching/mutations";
import { useCourseStaff } from "@/features/teaching/queries";
import { toApiError } from "@/lib/api-client";
import { cn, formatDate, initialsOf } from "@/lib/utils";
import type { StaffRole } from "@/types/teaching";

const ROLE_LABEL: Record<StaffRole, string> = {
  ta: "Teaching assistant",
  co_teacher: "Co-teacher",
};

const ROLE_OPTIONS = Object.entries(ROLE_LABEL) as Array<[StaffRole, string]>;

/**
 * Staff roster. The API adds people by numeric user id (there is no
 * user-search endpoint), so the form states that plainly and admins
 * can look ids up in Admin → Users.
 */
export function StaffTab({ courseId }: { courseId: number }) {
  const query = useCourseStaff(courseId);
  const mutations = useStaffMutations(courseId);
  const [error, setError] = useState("");

  const add = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const rawId = String(new FormData(form).get("userId") ?? "").trim();
    const staffRole = String(new FormData(form).get("staffRole") ?? "ta") as StaffRole;
    const userId = Number(rawId);

    if (!rawId || !Number.isInteger(userId) || userId < 1) {
      setError("Enter the user's numeric id (whole numbers only).");
      return;
    }

    setError("");
    mutations.addStaff.mutate(
      { userId, staffRole },
      {
        onSuccess: () => {
          form.reset();
        },
      }
    );
  };

  if (query.isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }

  if (query.isError || !query.data) {
    const status = toApiError(query.error).status;
    return (
      <ErrorState
        title={status === 403 ? "Staff not visible" : "Staff unavailable"}
        description={
          status === 403
            ? "Only the course owner or an admin can manage this team."
            : status === 404
              ? "Course not found."
              : toApiError(query.error).message
        }
      />
    );
  }

  const members = query.data;

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <p className="text-sm leading-6 text-ink-muted">
        The course owner keeps full access by default. Staff below can edit the
        curriculum and see quiz answers; students on the roster keep their existing
        enrollments.
      </p>

      {members.length === 0 ? (
        <EmptyState
          icon="users"
          title="No staff on this course yet"
          description="Add a teaching assistant or co-teacher to share the work."
          className="py-8"
        />
      ) : (
        <ul className="overflow-hidden rounded-card border border-line bg-surface">
          {members.map((member, index) => (
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
                {initialsOf(member.user.name)}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-ink">
                  {member.user.name}
                </span>
                <span className="block truncate text-[13px] text-ink-muted">
                  {member.user.email}
                </span>
              </span>

              <span className="w-44">
                <Select
                  label="Role"
                  aria-label={`Role for ${member.user.name}`}
                  value={member.staffRole}
                  onChange={(event) =>
                    mutations.updateStaff.mutate({
                      userId: member.userId,
                      staffRole: event.target.value as StaffRole,
                    })
                  }
                >
                  {ROLE_OPTIONS.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </span>

              <span className="hidden font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted sm:block">
                since {formatDate(member.assignedAt)}
              </span>

              <ConfirmIcon
                label={`Remove ${member.user.name} from course staff`}
                onConfirm={() => mutations.removeStaff.mutateAsync(member.userId)}
              />
            </li>
          ))}
        </ul>
      )}

      {/* Add form */}
      <form
        onSubmit={add}
        className="flex flex-wrap items-end gap-3 rounded-card border border-dashed border-line-strong px-4 py-4 sm:px-5"
      >
        <div className="w-40">
          <Input
            label="User id"
            name="userId"
            type="number"
            min={1}
            step={1}
            placeholder="12"
            inputMode="numeric"
          />
        </div>
        <div className="w-52">
          <Select label="Role" name="staffRole" defaultValue="ta">
            {ROLE_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <div className="pt-7">
          <Button
            type="submit"
            iconStart="plus"
            loading={mutations.addStaff.isPending}
          >
            Add member
          </Button>
        </div>
        <div className="w-full">
          <p className={cn("text-[13px] leading-5", error ? "text-clay" : "text-ink-muted")}>
            {error ||
              "The API resolves people by numeric user id — admins can find ids under Admin → Users."}
          </p>
        </div>
      </form>
    </div>
  );
}
