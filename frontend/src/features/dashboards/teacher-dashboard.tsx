"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/auth-provider";
import { useTeacherDashboard } from "@/features/dashboards/queries";
import {
  DashboardError,
  DashboardSkeleton,
  StatStrip,
} from "@/features/dashboards/dashboard-bits";
import { PageHeader } from "@/components/layout/page";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Badge, EmptyState } from "@/components/ui/primitives";
import { Thumb } from "@/components/ui/thumb";
import { useToast } from "@/components/providers/toast-provider";
import { apiClient, toApiError } from "@/lib/api-client";
import { timeAgo } from "@/lib/utils";
import { COURSE_STATUS_TONE } from "@/constants/status";
import type { ApiEnvelope } from "@/types/api";
import type { CourseStatus } from "@/types/course";

export function TeacherDashboard() {
  const { user } = useAuth();
  const query = useTeacherDashboard();
  const router = useRouter();
  const { push } = useToast();
  const queryClient = useQueryClient();

  const createCourse = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<ApiEnvelope<{ id: number }>>("/course", {
        title: "Untitled course",
      });
      return response.data.data!.id;
    },
    onSuccess: (courseId) => {
      router.push(`/teaching/${courseId}`);
    },
    onError: (error) => {
      push(toApiError(error).message, "error");
    },
  });

  if (query.isLoading) return <DashboardSkeleton />;
  if (query.isError || !query.data) {
    return <DashboardError error={query.error} onRetry={() => query.refetch()} />;
  }

  const data = query.data;
  const canCreate = user?.role === "teacher" || user?.role === "admin";
  const firstName = user?.name.split(" ")[0] ?? "there";

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["dashboard", "teacher"] });
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Teaching"
        title={`Your courses, ${firstName}`}
        description="Owned and staffed courses, enrollment movement, and where students lose points."
        actions={
          canCreate ? (
            <Button
              iconStart="plus"
              loading={createCourse.isPending}
              onClick={() => createCourse.mutate()}
            >
              New course
            </Button>
          ) : undefined
        }
      />

      <StatStrip
        className="lg:grid-cols-6"
        items={[
          { label: "Courses", value: data.summary.totalCourses },
          { label: "Published", value: data.summary.published },
          { label: "In review", value: data.summary.pending },
          { label: "Students", value: data.summary.totalStudents },
          { label: "Enrollments", value: data.summary.totalEnrollments },
          { label: "Lessons", value: data.summary.totalLessons },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[1.65fr_1fr]">
        {/* Courses table */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader
              title="Courses"
              subtitle="Ordered by last update"
              action={
                <span className="font-mono text-[11px] uppercase tracking-widest text-ink-muted">
                  {data.courses.length} total
                </span>
              }
            />
            {data.courses.length === 0 ? (
              <EmptyState
                icon="book"
                title="No courses yet"
                description="Create a course, add sections and lessons, then submit it for review."
                action={
                  canCreate ? (
                    <Button
                      size="sm"
                      iconStart="plus"
                      loading={createCourse.isPending}
                      onClick={() => createCourse.mutate()}
                    >
                      New course
                    </Button>
                  ) : undefined
                }
                className="m-5 sm:m-6"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-160 text-left">
                  <thead>
                    <tr className="border-b border-line">
                      <th className="label px-6 py-3 font-normal">Course</th>
                      <th className="label px-3 py-3 font-normal">Status</th>
                      <th className="label px-3 py-3 text-right font-normal">Learners</th>
                      <th className="label px-3 py-3 text-right font-normal">Rating</th>
                      <th className="label px-3 py-3 text-right font-normal">Lessons</th>
                      <th className="label px-6 py-3 font-normal" />
                    </tr>
                  </thead>
                  <tbody>
                    {data.courses.map((course) => (
                      <tr
                        key={course.id}
                        className="border-b border-line transition-colors last:border-b-0 hover:bg-surface-muted/60"
                      >
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            <Thumb url={course.thumbnailUrl} title={course.title} size="sm" />
                            <div className="min-w-0">
                              <Link
                                href={`/teaching/${course.id}`}
                                className="link-underline block truncate text-sm font-medium text-ink"
                              >
                                {course.title}
                              </Link>
                              <span className="block text-[13px] text-ink-muted">
                                {course.isOwner ? "Owner" : "Staff"} · updated{" "}
                                {timeAgo(course.updatedAt)}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3.5">
                          <Badge tone={COURSE_STATUS_TONE[course.status as CourseStatus] ?? "neutral"}>
                            {course.status}
                          </Badge>
                        </td>
                        <td className="px-3 py-3.5 text-right font-mono text-sm tabular-nums text-ink">
                          {course.enrollments}
                        </td>
                        <td className="px-3 py-3.5 text-right font-mono text-sm tabular-nums text-ink">
                          {course.reviewCount > 0 ? (
                            <span className="inline-flex items-center gap-1 text-amber">
                              <Icon name="star" size={13} />
                              {course.reviewAverage.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-ink-muted">—</span>
                          )}
                        </td>
                        <td className="px-3 py-3.5 text-right font-mono text-sm tabular-nums text-ink">
                          {course.lessons}
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <ButtonLink
                            href={`/teaching/${course.id}`}
                            variant="quiet"
                            size="sm"
                            iconEnd="arrow-right"
                          >
                            Open
                          </ButtonLink>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Weakest questions */}
          <Card>
            <CardHeader
              title="Weakest questions"
              subtitle="Highest wrong-answer rate, from real attempts"
            />
            <div className="px-5 sm:px-6">
              {data.quizAnalytics.weakestQuestions.length === 0 ? (
                <p className="py-6 text-sm text-ink-muted">
                  No question has been answered yet. Data appears after the
                  first quiz submissions.
                </p>
              ) : (
                <ul className="flex flex-col">
                  {data.quizAnalytics.weakestQuestions.map((question) => (
                    <li
                      key={question.questionId}
                      className="flex items-start gap-4 border-t border-line py-3.5 first:border-t-0 first:pt-4"
                    >
                      <span className="shrink-0 font-mono text-sm tabular-nums text-clay">
                        {Math.round(question.wrongRate)}%
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-ink">{question.questionText}</span>
                        <span className="block text-[13px] text-ink-muted">
                          {question.quizTitle} · {question.wrong} of {question.answers} wrong
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader title="Quiz analytics" subtitle="Attempts and pass rates" />
            <div className="px-5 sm:px-6">
              {data.quizAnalytics.quizzes.length === 0 ? (
                <p className="py-6 text-sm text-ink-muted">
                  No quizzes have attempts yet.
                </p>
              ) : (
                <ul className="flex flex-col">
                  {data.quizAnalytics.quizzes.slice(0, 6).map((quiz) => (
                    <li key={quiz.quizId} className="border-t border-line py-3.5 first:border-t-0 first:pt-4">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="min-w-0 truncate text-sm font-medium text-ink">
                          {quiz.title}
                        </span>
                        <span className="shrink-0 font-mono text-sm tabular-nums text-pine">
                          {Math.round(quiz.passRate)}%
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-muted">
                        <div
                          className="h-full rounded-full bg-pine"
                          style={{ width: `${Math.round(quiz.passRate)}%` }}
                        />
                      </div>
                      <p className="mt-1.5 text-[13px] text-ink-muted">
                        {quiz.passed}/{quiz.attempts} passed · avg {Math.round(quiz.averageScore)}% ·{" "}
                        {quiz.students} {quiz.students === 1 ? "student" : "students"}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title="Recent enrollments" subtitle="Last 10 across your courses" />
            <div className="px-5 sm:px-6">
              {data.recentEnrollments.length === 0 ? (
                <p className="py-6 text-sm text-ink-muted">
                  No enrollments yet. They appear here the moment a student joins.
                </p>
              ) : (
                <ul className="flex flex-col">
                  {data.recentEnrollments.map((enrollment) => (
                    <li
                      key={enrollment.id}
                      className="flex items-center gap-3 border-t border-line py-3 first:border-t-0 first:pt-4"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink">
                          {enrollment.userName}
                        </span>
                        <span className="block truncate text-[13px] text-ink-muted">
                          {enrollment.courseTitle}
                        </span>
                      </span>
                      <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
                        {timeAgo(enrollment.enrolledAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>

          <button
            type="button"
            onClick={() => invalidate()}
            className="flex items-center justify-center gap-2 rounded-(--radius-control) border border-line py-2.5 text-[13px] text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
          >
            <Icon name="refresh" size={14} />
            Refresh analytics
          </button>
        </div>
      </div>
    </div>
  );
}
