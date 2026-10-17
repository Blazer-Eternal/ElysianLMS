"use client";

import { useMemo, useState } from "react";
import { useStudentDashboard } from "@/features/dashboards/queries";
import { CourseRows } from "@/features/learning/course-rows";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DashboardError, DashboardSkeleton } from "@/features/dashboards/dashboard-bits";
import { EmptyState } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

type Filter = "all" | "active" | "finished";

const FILTERS: Array<{ value: Filter; label: string }> = [
  { value: "all", label: "All" },
  { value: "active", label: "In progress" },
  { value: "finished", label: "Completed" },
];

/**
 * My learning reads the same query as the student dashboard, so the page
 * opens instantly after a visit and always shows real per-course progress
 * (the enrollment endpoint alone does not carry percent).
 */
export default function MyLearningPage() {
  const query = useStudentDashboard();
  const [filter, setFilter] = useState<Filter>("all");

  const courses = useMemo(() => {
    const all = query.data?.courses ?? [];
    if (filter === "active") return all.filter((course) => course.percent < 100);
    if (filter === "finished") return all.filter((course) => course.percent >= 100);
    return all;
  }, [query.data, filter]);

  const total = query.data?.courses.length ?? 0;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Learn"
        title="My learning"
        description="Every course you are enrolled in, with lesson progress and a resume point."
        actions={
          <div
            role="tablist"
            aria-label="Filter enrollments"
            className="inline-flex rounded-(--radius-control) border border-line bg-surface p-0.5"
          >
            {FILTERS.map((option) => (
              <button
                key={option.value}
                type="button"
                role="tab"
                aria-selected={filter === option.value}
                onClick={() => setFilter(option.value)}
                className={cn(
                  "rounded-md px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest transition-colors",
                  filter === option.value
                    ? "bg-pine text-paper"
                    : "text-ink-muted hover:bg-surface-muted hover:text-ink"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="mt-8">
        {query.isLoading ? (
          <DashboardSkeleton />
        ) : query.isError || !query.data ? (
          <DashboardError error={query.error} onRetry={() => query.refetch()} />
        ) : total === 0 ? (
          <EmptyState
            icon="cap"
            title="Nothing enrolled yet"
            description="Enroll in a course from the catalog and it appears here with its progress."
            action={
              <ButtonLink href="/courses" size="sm" iconEnd="arrow-right">
                Browse the catalog
              </ButtonLink>
            }
          />
        ) : courses.length === 0 ? (
          <EmptyState
            title={filter === "active" ? "Nothing in progress" : "Nothing completed yet"}
            description={
              filter === "active"
                ? "Every enrolled course is finished. Open one to review it."
                : "Courses reach 100 percent when all their lessons are marked complete."
            }
            action={
              <Button variant="secondary" size="sm" onClick={() => setFilter("all")}>
                Show all
              </Button>
            }
          />
        ) : (
          <Card className="px-5 sm:px-6">
            <CourseRows courses={courses} />
          </Card>
        )}
      </div>
    </PageContainer>
  );
}
