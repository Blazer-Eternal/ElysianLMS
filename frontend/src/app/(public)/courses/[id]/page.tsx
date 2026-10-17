"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/features/auth/auth-provider";
import { useStudentDashboard } from "@/features/dashboards/queries";
import { useCourse, useCourseProgress, useCourseReviews } from "@/features/courses/queries";
import { EnrollActions } from "@/features/courses/enroll-actions";
import { ReviewsSection } from "@/features/courses/reviews-section";
import { CurriculumSection } from "@/features/courses/curriculum-section";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { EmptyState, Skeleton, Spinner } from "@/components/ui/primitives";
import { Stars } from "@/components/ui/stars";
import { Thumb } from "@/components/ui/thumb";
import { ApiError } from "@/types/api";
import { formatDate, formatPrice } from "@/lib/utils";

export default function CourseDetailPage() {
  return (
    <Suspense fallback={<CoursePageSkeleton />}>
      <CourseDetail />
    </Suspense>
  );
}

function CourseDetail() {
  const params = useParams<{ id: string }>();
  const courseId = Number(params.id);

  return <CourseDetailBody courseId={courseId} />;
}

function CourseDetailBody({ courseId }: { courseId: number }) {
  const courseQuery = useCourse(courseId);
  const reviewsQuery = useCourseReviews(courseId);
  const { status } = useAuth();
  const dashboard = useStudentDashboard(status === "authenticated");

  if (courseQuery.isLoading) return <CoursePageSkeleton />;

  if (courseQuery.isError || !courseQuery.data) {
    const notFound =
      courseQuery.error instanceof ApiError && courseQuery.error.status === 404;
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-24 sm:px-6">
        <EmptyState
          icon={notFound ? "search" : "alert"}
          title={notFound ? "Course not found" : "Course unavailable"}
          description={
            notFound
              ? "This course does not exist, is not published yet, or was archived."
              : courseQuery.error instanceof ApiError
                ? courseQuery.error.message
                : "Something went wrong while loading this course."
          }
          action={
            <ButtonLink href="/courses" variant="secondary" size="sm" iconEnd="arrow-right">
              Back to catalog
            </ButtonLink>
          }
        />
      </div>
    );
  }

  const course = courseQuery.data;
  const summary = reviewsQuery.data?.summary ?? { average: 0, count: 0 };
  const enrolled = !!dashboard.data?.courses.some((entry) => entry.id === courseId);

  return (
    <>
      {/* ------------------------------ Header ------------------------------ */}
      <section className="border-b border-line bg-surface">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.5fr_1fr] lg:px-10 lg:py-16">
          <div className="min-w-0">
            <p className="label pb-4">{course.category?.name ?? "Course"}</p>
            <h1 className="font-display text-[clamp(2rem,4vw,3.1rem)] leading-[1.08] font-semibold text-ink">
              {course.title}
            </h1>

            {course.description ? (
              <p className="mt-5 max-w-2xl text-[16px] leading-7 text-ink-muted">
                {course.description}
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
              {course.teacher ? (
                <span className="flex items-center gap-2.5">
                  <Thumb url={course.teacher.avatarUrl} title={course.teacher.name} size="sm" />
                  <span className="text-sm">
                    <span className="font-medium text-ink">{course.teacher.name}</span>
                    <span className="block text-[13px] text-ink-muted">Instructor</span>
                  </span>
                </span>
              ) : null}

              {summary.count > 0 ? (
                <a href="#reviews" className="flex items-center gap-2">
                  <Stars value={summary.average} size={15} />
                  <span className="font-mono text-sm tabular-nums text-ink">
                    {summary.average.toFixed(1)}
                  </span>
                  <span className="text-[13px] text-ink-muted">
                    ({summary.count} {summary.count === 1 ? "review" : "reviews"})
                  </span>
                </a>
              ) : (
                <span className="text-[13px] text-ink-muted">No reviews yet</span>
              )}

              <span className="font-mono text-[11px] uppercase tracking-widest text-ink-muted">
                published {formatDate(course.createdAt)}
              </span>
            </div>
          </div>

          {/* Action card */}
          <div className="lg:pl-4">
            <div className="rounded-card border border-line bg-paper p-5 lg:sticky lg:top-24">
              <div className="flex items-baseline justify-between border-b border-line pb-4">
                <span className="font-mono text-3xl tabular-nums text-ink">
                  {course.price === 0 ? "Free" : formatPrice(course.price)}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-widest text-ink-muted">
                  {course.status === "published" ? "open for enrollment" : course.status}
                </span>
              </div>
              <div className="pt-4">
                <EnrollActions course={course} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------- Body ------------------------------- */}
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.55fr_1fr]">
          <div className="flex min-w-0 flex-col gap-12">
            {course.description ? (
              <section>
                <h2 className="border-b border-line pb-3 font-display text-2xl font-semibold text-ink">
                  About this course
                </h2>
                <p className="pt-4 text-[15px] leading-7 whitespace-pre-wrap text-ink-muted">
                  {course.description}
                </p>
              </section>
            ) : null}

            <CourseBody courseId={courseId} enabled={enrolled} />

            <ReviewsSection courseId={courseId} enrolled={enrolled} />
          </div>

          {/* Sidebar */}
          <aside className="lg:pt-1">
            <Card>
              <CardHeader title="Course facts" />
              <dl className="px-5 py-3 sm:px-6">
                {[
                  ["Instructor", course.teacher?.name ?? "Unknown"],
                  ["Category", course.category?.name ?? "Uncategorized"],
                  ["Price", course.price === 0 ? "Free" : formatPrice(course.price)],
                  ["Published", formatDate(course.createdAt)],
                  ["Last updated", formatDate(course.updatedAt)],
                ].map(([term, value], index) => (
                  <div
                    key={term}
                    className={
                      "flex items-baseline justify-between gap-4 py-2.5 " +
                      (index === 0 ? "" : "border-t border-line")
                    }
                  >
                    <dt className="label">{term}</dt>
                    <dd className="truncate text-right text-sm text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
            </Card>

            <div className="mt-5 rounded-card border border-line bg-surface px-5 py-4">
              <p className="flex items-center gap-2 text-sm font-medium text-ink">
                <Icon name={enrolled ? "check" : "lock"} size={15} className="text-ink-muted" />
                {enrolled ? "Curriculum below" : "Curriculum access"}
              </p>
              <p className="mt-1.5 text-[13px] leading-5 text-ink-muted">
                {enrolled
                  ? "Your sections and lessons are listed below with completion state."
                  : "Section and lesson listings open after enrollment. Preview lessons and reviews stay public."}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

/**
 * Enrolled-only body piece: the outline comes from the progress endpoint
 * (section/lesson endpoints are staff-only by design).
 */
function CourseBody({ courseId, enabled }: { courseId: number; enabled: boolean }) {
  const progressQuery = useCourseProgress(courseId, enabled);

  if (!enabled) return null;
  if (progressQuery.isLoading) {
    return (
      <section className="flex items-center gap-3">
        <Spinner label="Loading curriculum" />
      </section>
    );
  }
  if (progressQuery.isError || !progressQuery.data) return null;
  if (progressQuery.data.sections.length === 0) return null;

  return <CurriculumSection courseId={courseId} progress={progressQuery.data} />;
}

function CoursePageSkeleton() {
  return (
    <div>
      <div className="border-b border-line bg-surface">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.5fr_1fr] lg:px-10">
          <div className="flex flex-col gap-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-12 w-4/5" />
            <Skeleton className="h-20 w-full max-w-2xl" />
            <Skeleton className="h-10 w-72" />
          </div>
          <Skeleton className="h-72 w-full" />
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-10">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    </div>
  );
}
