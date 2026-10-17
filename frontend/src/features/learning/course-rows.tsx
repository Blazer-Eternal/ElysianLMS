"use client";

import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/primitives";
import { Thumb } from "@/components/ui/thumb";
import { timeAgo } from "@/lib/utils";
import type { StudentCourseSummary } from "@/types/dashboard";

/**
 * One enrolled-course row, shared by the dashboard and My learning.
 * Progress bar, resume point, and honest lesson counts.
 */
export function CourseRows({ courses }: { courses: StudentCourseSummary[] }) {
  return (
    <ul className="flex flex-col">
      {courses.map((course) => {
        const finished = course.percent >= 100;
        return (
          <li
            key={course.id}
            className="flex flex-wrap items-center gap-4 border-t border-line py-4 first:border-t-0"
          >
            <Thumb url={course.thumbnailUrl} title={course.title} />

            <div className="min-w-0 flex-1 basis-52">
              <Link
                href={`/learn/${course.id}`}
                className="link-underline font-display text-[17px] font-semibold text-ink"
              >
                {course.title}
              </Link>
              <p className="mt-1 text-[13px] text-ink-muted">
                Enrolled {timeAgo(course.enrolledAt)} · {course.completedLessons} of{" "}
                {course.totalLessons} lessons
                {course.status !== "published" ? (
                  <span className="ml-2 font-mono text-[11px] uppercase tracking-[0.08em] text-amber">
                    {course.status}
                  </span>
                ) : null}
              </p>
              <ProgressBar value={course.percent} className="mt-2.5 max-w-sm" />
            </div>

            <ButtonLink
              href={`/learn/${course.id}`}
              variant={finished ? "secondary" : "primary"}
              size="sm"
            >
              {finished ? "Review" : "Resume"}
            </ButtonLink>
          </li>
        );
      })}
    </ul>
  );
}
