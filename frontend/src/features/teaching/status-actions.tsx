"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/primitives";
import { useToast } from "@/components/providers/toast-provider";
import {
  useCourseDetailMutations,
  type CourseStatusValue,
} from "@/features/teaching/mutations";
import { COURSE_STATUS_HINT, COURSE_STATUS_TONE } from "@/constants/status";
import type { CourseStatus } from "@/types/course";
import type { Role } from "@/types/auth";

const ALL_STATUSES: CourseStatusValue[] = [
  "draft",
  "pending",
  "published",
  "rejected",
  "archived",
];

export function StatusBadge({ status }: { status: CourseStatus }) {
  return <Badge tone={COURSE_STATUS_TONE[status]}>{status}</Badge>;
}

/**
 * Status transitions follow the backend's state machine:
 *  - teachers/staff may submit (draft|rejected → pending, content gate)
 *    and archive;
 *  - admins may set any status from the same select everywhere.
 */
export function StatusActions({
  courseId,
  status,
  role,
}: {
  courseId: number;
  status: CourseStatus;
  role: Role;
}) {
  const { updateStatus } = useCourseDetailMutations(courseId);
  const { push } = useToast();
  const selectRef = useRef<HTMLSelectElement>(null);

  const apply = (target: CourseStatusValue) => {
    updateStatus.mutate(target, {
      onSuccess: () => push(`Course status set to “${target}”.`, "success"),
    });
  };

  const hint = COURSE_STATUS_HINT[status];
  const busy = updateStatus.isPending;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2.5">
        {role === "admin" ? (
          <>
            <select
              ref={selectRef}
              key={status}
              defaultValue={status}
              aria-label="Course status"
              className="h-9 rounded-(--radius-control) border border-line-strong bg-surface px-3 text-sm text-ink"
            >
              {ALL_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            <Button
              size="sm"
              loading={busy}
              onClick={() => {
                const value = selectRef.current?.value as CourseStatusValue | undefined;
                if (value && value !== status) apply(value);
              }}
            >
              Apply
            </Button>
          </>
        ) : status === "draft" || status === "rejected" ? (
          <Button
            size="sm"
            iconStart="send"
            loading={busy}
            onClick={() => apply("pending")}
          >
            {status === "rejected" ? "Resubmit for review" : "Submit for review"}
          </Button>
        ) : status === "pending" ? (
          <span className="inline-flex items-center gap-2 text-sm text-ink-muted">
            <Badge tone="attention">awaiting review</Badge>
            <Button
              variant="secondary"
              size="sm"
              loading={busy}
              onClick={() => apply("archived")}
            >
              Withdraw &amp; archive
            </Button>
          </span>
        ) : status === "published" ? (
          <Button
            variant="secondary"
            size="sm"
            iconStart="lock"
            loading={busy}
            onClick={() => apply("archived")}
          >
            Archive
          </Button>
        ) : (
          <span className="text-sm text-ink-muted">
            Archived — an admin can restore it.
          </span>
        )}
      </div>
      <p className="text-[13px] text-ink-muted">{hint}</p>
    </div>
  );
}
