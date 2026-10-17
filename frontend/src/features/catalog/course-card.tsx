import Link from "next/link";
import { Thumb } from "@/components/ui/thumb";
import { Icon } from "@/components/ui/icon";
import { formatPrice } from "@/lib/utils";
import type { Course } from "@/types/course";

/**
 * Catalog card: image band, editorial title, mono meta. The whole card
 * links; no nested interactive elements, no hover fades.
 */
export function CourseCard({ course }: { course: Course }) {
  return (
    <Link
      href={`/courses/${course.id}`}
      className="group flex flex-col overflow-hidden rounded-card border border-line bg-surface transition-colors hover:border-line-strong"
    >
      <div className="relative flex h-36 items-center justify-center overflow-hidden border-b border-line bg-surface-muted">
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt=""
            aria-hidden
            className="h-full w-full object-cover"
          />
        ) : (
          <Thumb title={course.title} url={null} size="lg" className="rounded-none bg-transparent" />
        )}
        <span
          className={
            "absolute left-3 top-3 rounded-full border px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-[0.08em] " +
            (course.price === 0
              ? "border-pine/35 bg-pine-soft text-pine"
              : "border-line-strong bg-surface text-ink")
          }
        >
          {course.price === 0 ? "Free" : formatPrice(course.price)}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="label">{course.category?.name ?? "Course"}</p>
        <h3 className="mt-1.5 font-display text-lg leading-snug font-semibold text-ink">
          <span className="link-underline">{course.title}</span>
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-6 text-ink-muted">
          {course.description || "No description provided yet."}
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-line pt-3.5">
          <span className="flex min-w-0 items-center gap-2 text-[13px] text-ink-muted">
            <Icon name="user" size={14} />
            <span className="truncate">{course.teacher?.name ?? "Unknown instructor"}</span>
          </span>
          <span className="shrink-0 font-mono text-[11px] uppercase tracking-widest text-ink-muted transition-colors group-hover:text-pine">
            View
          </span>
        </div>
      </div>
    </Link>
  );
}
