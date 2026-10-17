"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PageContainer } from "@/components/layout/page";
import { ButtonLink } from "@/components/ui/button";
import { ErrorState, Skeleton } from "@/components/ui/primitives";
import { useAuth } from "@/features/auth/auth-provider";
import { useWorkspaceCourse } from "@/features/teaching/queries";
import { StatusActions, StatusBadge } from "@/features/teaching/status-actions";
import { CurriculumTab } from "@/features/teaching/curriculum-tab";
import { DetailsTab } from "@/features/teaching/details-tab";
import { StaffTab } from "@/features/teaching/staff-tab";
import { cn, formatPrice } from "@/lib/utils";
import { toApiError } from "@/lib/api-client";

type TabKey = "curriculum" | "details" | "staff";

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: "curriculum", label: "Curriculum" },
  { key: "details", label: "Course details" },
  { key: "staff", label: "Staff" },
];

/**
 * Course workspace: status machine in the header, then three tabs over
 * the staff endpoints (curriculum, details, team). Access is enforced
 * server-side per mutation; the shell degrades to clear error copy.
 */
export default function TeachingCoursePage() {
  const params = useParams<{ courseId: string }>();
  const courseId = Number(params.courseId);

  return <WorkspaceBody courseId={courseId} />;
}

function WorkspaceBody({ courseId }: { courseId: number }) {
  const { user } = useAuth();
  const isOwnerScope = user?.role === "teacher" || user?.role === "admin";
  const { course, isLoading, error, refetch } = useWorkspaceCourse(courseId, isOwnerScope);
  const [tab, setTab] = useState<TabKey>("curriculum");

  if (!Number.isFinite(courseId)) {
    return (
      <PageContainer>
        <ErrorState
          title="Course not found"
          description="That URL does not point at a valid course id."
          action={
            <ButtonLink href="/teaching" variant="secondary" size="sm">
              Back to workspace
            </ButtonLink>
          }
        />
      </PageContainer>
    );
  }

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex flex-col gap-4 border-b border-line pb-6">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-9 w-2/3" />
          <Skeleton className="h-9 w-72" />
        </div>
        <div className="mt-6 flex flex-col gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </PageContainer>
    );
  }

  if (!course) {
    return (
      <PageContainer>
        <ErrorState
          title="Course unavailable"
          description={
            error
              ? toApiError(error).status === 404
                ? "No course with this id exists, or you cannot see it."
                : toApiError(error).message
              : "Could not load this course."
          }
          action={
            <div className="flex gap-2.5">
              <ButtonLink href="/teaching" variant="secondary" size="sm">
                Back to workspace
              </ButtonLink>
              <button
                type="button"
                onClick={() => refetch()}
                className="text-sm text-pine link-underline"
              >
                Try again
              </button>
            </div>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-x-8 gap-y-5 border-b border-line pb-6">
        <div className="min-w-0">
          <Link
            href="/teaching"
            className="link-underline inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink"
          >
            <span aria-hidden>←</span> All courses
          </Link>
          <p className="label pt-4 pb-2">Teaching workspace</p>
          <h1 className="font-display text-[clamp(1.6rem,3vw,2.2rem)] leading-tight font-semibold text-ink">
            {course.title}
          </h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
            <span>{course.slug}</span>
            <span aria-hidden>·</span>
            <span>{course.price === 0 ? "free" : formatPrice(course.price)}</span>
            <span aria-hidden>·</span>
            <StatusBadge status={course.status} />
          </p>
        </div>

        <div className="w-full max-w-md shrink-0 sm:w-auto">
          <StatusActions
            courseId={courseId}
            status={course.status}
            role={user?.role ?? "student"}
          />
        </div>
      </header>

      {/* Tabs */}
      <nav
        aria-label="Workspace sections"
        className="flex gap-6 border-b border-line"
      >
        {TABS.map((item) => {
          const active = tab === item.key;
          return (
            <button
              key={item.key}
              type="button"
              aria-current={active ? "page" : undefined}
              onClick={() => setTab(item.key)}
              className={cn(
                "-mb-px border-b-2 px-1 pt-4 pb-3 text-sm font-medium transition-colors",
                active
                  ? "border-pine text-pine"
                  : "border-transparent text-ink-muted hover:text-ink"
              )}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Panels */}
      <div className="pt-7">
        {tab === "curriculum" ? <CurriculumTab courseId={courseId} /> : null}
        {tab === "details" ? <DetailsTab course={course} /> : null}
        {tab === "staff" ? <StaffTab courseId={courseId} /> : null}
      </div>
    </PageContainer>
  );
}
