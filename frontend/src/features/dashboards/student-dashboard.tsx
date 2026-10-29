"use client";

import Link from "next/link";
import { useAuth } from "@/features/auth/auth-provider";
import { useStudentDashboard } from "@/features/dashboards/queries";
import { CourseRows } from "@/features/learning/course-rows";
import {
  DashboardError,
  DashboardSkeleton,
  StatStrip,
} from "@/features/dashboards/dashboard-bits";
import { PageHeader } from "@/components/layout/page";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { EmptyState } from "@/components/ui/primitives";
import { Thumb } from "@/components/ui/thumb";
import { formatPrice, timeAgo } from "@/lib/utils";

export function StudentDashboard() {
  const { user } = useAuth();
  const query = useStudentDashboard();

  if (query.isLoading) return <DashboardSkeleton />;
  if (query.isError || !query.data) {
    return <DashboardError error={query.error} onRetry={() => query.refetch()} />;
  }

  const data = query.data;
  const firstName = user?.name.split(" ")[0] ?? "there";

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Student"
        title={`Welcome back, ${firstName}`}
        description="Your enrollments, the lesson you left open, and what is waiting on you."
        actions={
          <ButtonLink href="/courses" variant="secondary" iconEnd="arrow-right">
            Browse courses
          </ButtonLink>
        }
      />

      <StatStrip
        items={[
          { label: "Enrolled", value: data.summary.enrolled },
          { label: "Completed", value: data.summary.completed },
          { label: "In progress", value: data.summary.inProgress },
          {
            label: "Avg. progress",
            value: `${data.summary.averageProgress}%`,
            note: "across active courses",
          },
        ]}
      />

      {data.pendingOrder ? (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-amber/40 bg-amber-soft px-5 py-4">
          <div className="flex items-start gap-3">
            <Icon name="clock" size={18} className="mt-0.5 text-amber" />
            <div>
              <p className="text-sm font-medium text-ink">
                Payment pending for “{data.pendingOrder.course.title}”
              </p>
              <p className="mt-0.5 text-[13px] text-ink-muted">
                Order #{data.pendingOrder.id} · {formatPrice(data.pendingOrder.amount)} ·
                awaiting confirmation
              </p>
            </div>
          </div>
          <ButtonLink href="/orders" variant="secondary" size="sm">
            View orders
          </ButtonLink>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.65fr_1fr]">
        {/* Left column: resume + enrollments */}
        <div className="flex flex-col gap-6">
          {data.continueLearning ? (
            <Card>
              <CardBody>
                <p className="label">Continue learning</p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-ink">
                  {data.continueLearning.courseTitle}
                </h2>
                <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-muted">
                  <span>{data.continueLearning.sectionTitle}</span>
                  <Icon name="chevron-right" size={13} />
                  <span className="text-ink">{data.continueLearning.lessonTitle}</span>
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <ButtonLink
                    href={`/learn/${data.continueLearning.courseId}?lesson=${data.continueLearning.lessonId}`}
                    iconStart="play"
                  >
                    Resume lesson
                  </ButtonLink>
                  <ButtonLink
                    href={`/learn/${data.continueLearning.courseId}`}
                    variant="quiet"
                    size="sm"
                  >
                    Open course
                  </ButtonLink>
                </div>
              </CardBody>
            </Card>
          ) : null}

          {data.courses.length > 0 ? (
            <Card>
              <CardHeader
                title="Enrollments"
                subtitle="Every course you are enrolled in"
                action={
                  <Link href="/my-learning" className="text-sm text-pine hover:text-pine-deep">
                    Open my learning
                  </Link>
                }
              />
              <div className="px-5 sm:px-6">
                <CourseRows courses={data.courses} />
              </div>
            </Card>
          ) : data.continueLearning ? null : (
            <EmptyState
              icon="book"
              title="No enrollments yet"
              description="Courses you enroll in show up here with their progress and a resume point."
              action={
                <ButtonLink href="/courses" size="sm" iconEnd="arrow-right">
                  Browse the catalog
                </ButtonLink>
              }
            />
          )}
        </div>

        {/* Right column: quizzes + reviews */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader title="Quiz performance" subtitle="All attempts across your courses" />
            <CardBody className="pt-5">
              <div className="grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-line bg-line">
                {[
                  ["Attempts", String(data.quizSummary.totalAttempts)],
                  ["Passed", String(data.quizSummary.passedAttempts)],
                  ["Avg. score", `${data.quizSummary.averageScore}%`],
                ].map(([label, value]) => (
                  <div key={label} className="bg-surface px-3 py-3 text-center">
                    <p className="font-mono text-xl leading-none tabular-nums text-ink">{value}</p>
                    <p className="label mt-1.5">{label}</p>
                  </div>
                ))}
              </div>

              {data.recentAttempts.length > 0 ? (
                <ul className="mt-4 flex flex-col">
                  {data.recentAttempts.map((attempt) => (
                    <li
                      key={attempt.id}
                      className="flex items-center gap-3 border-t border-line py-3 first:border-t-0 first:pt-0"
                    >
                      <span
                        aria-hidden
                        className={
                          attempt.passed
                            ? "flex size-7 shrink-0 items-center justify-center rounded-full bg-pine-soft text-pine"
                            : "flex size-7 shrink-0 items-center justify-center rounded-full bg-clay-soft text-clay"
                        }
                      >
                        <Icon name={attempt.passed ? "check" : "close"} size={13} strokeWidth={2.2} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink">
                          {attempt.quizTitle}
                        </span>
                        <span className="block truncate text-[13px] text-ink-muted">
                          {attempt.courseTitle} · {timeAgo(attempt.submittedAt)}
                        </span>
                      </span>
                      <span
                        className={
                          "shrink-0 font-mono text-sm tabular-nums " +
                          (attempt.passed ? "text-pine" : "text-clay")
                        }
                      >
                        {attempt.score}%
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-ink-muted">
                  No quiz attempts yet. Scores appear after your first submission.
                </p>
              )}
            </CardBody>
          </Card>

          {data.unreviewedCourses.length > 0 ? (
            <Card>
              <CardHeader
                title="Reviews waiting on you"
                subtitle="One review per finished course"
              />
              <div className="px-5 sm:px-6">
                <ul className="flex flex-col">
                  {data.unreviewedCourses.map((course) => (
                    <li
                      key={course.id}
                      className="flex items-center gap-3 border-t border-line py-3.5 first:border-t-0 first:pt-4"
                    >
                      <Thumb url={course.thumbnailUrl} title={course.title} size="sm" />
                      <span className="min-w-0 flex-1">
                        <Link
                          href={`/courses/${course.id}#reviews`}
                          className="link-underline truncate text-sm font-medium text-ink"
                        >
                          {course.title}
                        </Link>
                      </span>
                      <ButtonLink
                        href={`/courses/${course.id}#reviews`}
                        variant="secondary"
                        size="sm"
                        iconEnd="arrow-right"
                      >
                        Review
                      </ButtonLink>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}