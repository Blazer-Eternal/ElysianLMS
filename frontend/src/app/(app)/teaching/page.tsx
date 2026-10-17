"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { EmptyState, ErrorState, FormAlert, Skeleton } from "@/components/ui/primitives";
import { Thumb } from "@/components/ui/thumb";
import { useToast } from "@/components/providers/toast-provider";
import { useAuth } from "@/features/auth/auth-provider";
import { useTeacherDashboard } from "@/features/dashboards/queries";
import { StatusBadge } from "@/features/teaching/status-actions";
import { COURSE_STATUS_HINT } from "@/constants/status";
import { apiClient, toApiError } from "@/lib/api-client";
import { timeAgo } from "@/lib/utils";
import type { ApiEnvelope } from "@/types/api";
import type { CourseStatus } from "@/types/course";

/**
 * Course index for teaching staff (teacher dashboard data, shared
 * cache key — arriving from /dashboard keeps this instant). Creation
 * is limited to roles the backend's grantRole check accepts.
 */
export default function TeachingPage() {
  const { user } = useAuth();
  const query = useTeacherDashboard();
  const router = useRouter();
  const { push } = useToast();
  const queryClient = useQueryClient();

  const canCreate = user?.role === "teacher" || user?.role === "admin";
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const createCourse = useMutation({
    mutationFn: async (title: string) => {
      const response = await apiClient.post<ApiEnvelope<{ id: number }>>("/course", { title });
      return response.data.data!.id;
    },
    onSuccess: (courseId) => {
      push("Draft course created.", "success");
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "teacher"] });
      router.push(`/teaching/${courseId}`);
    },
    onError: (error) => push(toApiError(error).message, "error"),
  });

  const submitCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = String(new FormData(event.currentTarget).get("title") ?? "").trim();
    if (!title) {
      setCreateError("Give the course a working title — you can refine it later.");
      return;
    }
    setCreateError("");
    createCourse.mutate(title);
  };

  /* -------------------------------- states -------------------------------- */

  if (query.isLoading) {
    return (
      <PageContainer>
        <PageHeader eyebrow="Teaching" title="Workspace" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-56 w-full" />
        </div>
      </PageContainer>
    );
  }

  if (query.isError || !query.data) {
    const status = toApiError(query.error).status;
    return (
      <PageContainer>
        <PageHeader eyebrow="Teaching" title="Workspace" />
        <div className="mt-8">
          <ErrorState
            title={status === 403 ? "Teaching access required" : "Workspace unavailable"}
            description={
              status === 403
                ? "An admin grants teaching access per account. Your student tools stay in the dashboard."
                : toApiError(query.error).message
            }
            action={
              <Button variant="secondary" size="sm" onClick={() => query.refetch()}>
                Try again
              </Button>
            }
          />
        </div>
      </PageContainer>
    );
  }

  const { courses, summary } = query.data;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Teaching"
        title="Workspace"
        description={
          courses.length > 0
            ? `${summary.totalCourses} course${summary.totalCourses === 1 ? "" : "s"} under your name — open one to build its curriculum, quiz staff, and publishing flow.`
            : "Every course you own or staff appears here."
        }
        actions={
          canCreate ? (
            <Button
              iconStart="plus"
              onClick={() => setCreating((open) => !open)}
              aria-expanded={creating}
            >
              New course
            </Button>
          ) : null
        }
      />

      {/* Create form */}
      {creating && canCreate ? (
        <form
          onSubmit={submitCreate}
          className="mt-6 flex flex-wrap items-end gap-3 rounded-card border border-line bg-surface px-4 py-4 sm:px-5"
        >
          <div className="min-w-56 flex-1">
            <Input label="Working title" name="title" placeholder="e.g. Design Systems in Practice" />
          </div>
          <div className="pt-7">
            <Button type="submit" loading={createCourse.isPending}>
              Create draft
            </Button>
          </div>
          <div className="w-full">
            <FormAlert message={createError} />
          </div>
        </form>
      ) : null}

      {/* Course grid */}
      {courses.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon="book"
            title="No courses yet"
            description={
              canCreate
                ? "Create your first draft, add a section and a lesson, then submit it for review."
                : "You are staff on courses owned by others — ask the owner or an admin for access."
            }
            action={
              canCreate ? (
                <Button onClick={() => setCreating(true)} iconStart="plus">
                  New course
                </Button>
              ) : null
            }
          />
        </div>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => {
            const status = course.status as CourseStatus;
            return (
              <li key={course.id}>
                <Link
                  href={`/teaching/${course.id}`}
                  className="group flex h-full flex-col overflow-hidden rounded-card border border-line bg-surface transition-[transform,border-color] duration-150 hover:-translate-y-px hover:border-ink-muted"
                >
                  <div className="flex h-32 items-center justify-center overflow-hidden border-b border-line bg-surface-muted">
                    {course.thumbnailUrl ? (
                      <img
                        src={course.thumbnailUrl}
                        alt=""
                        aria-hidden
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Thumb
                        title={course.title}
                        url={null}
                        size="lg"
                        className="rounded-none bg-transparent"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="line-clamp-2 font-display text-[15px] leading-snug font-semibold text-ink group-hover:text-pine">
                        {course.title}
                      </h3>
                      <StatusBadge status={status} />
                    </div>

                    <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
                      {course.sections} section{course.sections === 1 ? "" : "s"} ·{" "}
                      {course.lessons} lesson{course.lessons === 1 ? "" : "s"} ·{" "}
                      {course.enrollments} enrolled
                    </p>

                    <div className="mt-auto flex items-end justify-between gap-3 pt-2">
                      <span
                        className={
                          "text-[12px] leading-4 " +
                          (status === "draft" || status === "rejected"
                            ? course.publishReady
                              ? "text-pine"
                              : "text-clay"
                            : "text-ink-muted")
                        }
                      >
                        {status === "draft" || status === "rejected"
                          ? course.publishReady
                            ? "Ready to submit"
                            : "Needs content"
                          : COURSE_STATUS_HINT[status]}
                      </span>
                      <span className="shrink-0 font-mono text-[11px] text-ink-muted">
                        {timeAgo(course.updatedAt)}
                      </span>
                    </div>

                    {!course.isOwner ? (
                      <span className="w-fit rounded-full border border-line-strong px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-ink-muted">
                        staff
                      </span>
                    ) : null}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </PageContainer>
  );
}
