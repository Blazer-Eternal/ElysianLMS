"use client";

import { Icon } from "@/components/ui/icon";
import { ProgressBar } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import type { CourseProgress } from "@/types/progress";
import { flattenLessons } from "@/features/learn/queries";

/**
 * Course outline as the learner sees it: sections in order, completion
 * state per lesson, the active lesson marked, quiz badges with best
 * scores. Selection is reported upward; the page owns navigation.
 */
export function OutlineSidebar({
  courseId,
  progress,
  activeLessonId,
  courseTitle,
  onSelect,
  className,
}: {
  courseId: number;
  progress: CourseProgress;
  activeLessonId: number | null;
  courseTitle?: string;
  onSelect: (lessonId: number) => void;
  className?: string;
}) {
  const quizzesByLesson = new Map(progress.quizzes.map((quiz) => [quiz.lessonId, quiz]));
  const sections = [...progress.sections].sort(
    (a, b) => a.section.orderIndex - b.section.orderIndex
  );
  const lessonCount = flattenLessons(progress).length;

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Course head */}
      <div className="border-b border-line px-5 py-5">
        <p className="label pb-3">Course outline</p>
        {courseTitle ? (
          <p className="font-display text-[17px] leading-snug font-semibold text-ink">
            {courseTitle}
          </p>
        ) : null}
        <div className={cn(courseTitle ? "mt-3" : "")}>
          <ProgressBar value={progress.percent} />
          <p className="mt-1.5 font-mono text-[11px] uppercase tracking-widest text-ink-muted">
            {progress.completedLessons} of {lessonCount || progress.totalLessons} lessons complete
          </p>
        </div>
      </div>

      {/* Sections */}
      <nav aria-label="Lessons" className="flex-1 overflow-y-auto px-3 py-4">
        <ol className="flex flex-col gap-5">
          {sections.map((section, sectionIndex) => {
            const lessons = [...section.lessons].sort(
              (a, b) => a.orderIndex - b.orderIndex
            );
            return (
              <li key={section.section.id}>
                <p className="flex items-baseline gap-2 px-2 pb-1.5">
                  <span className="font-mono text-[11px] text-pine">
                    {String(sectionIndex + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[13px] font-semibold text-ink">
                    {section.section.title}
                  </span>
                </p>

                <ul className="flex flex-col gap-0.5">
                  {lessons.map((lesson) => {
                    const active = lesson.id === activeLessonId;
                    const quiz = quizzesByLesson.get(lesson.id);
                    return (
                      <li key={lesson.id}>
                        <button
                          type="button"
                          onClick={() => onSelect(lesson.id)}
                          aria-current={active ? "true" : undefined}
                          className={cn(
                            "flex w-full items-start gap-2.5 rounded-(--radius-control) px-2.5 py-2 text-left transition-colors",
                            active
                              ? "bg-pine-soft text-pine"
                              : "text-ink-muted hover:bg-surface-muted hover:text-ink"
                          )}
                        >
                          <span
                            aria-hidden
                            className={cn(
                              "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border",
                              lesson.completed
                                ? "border-pine bg-pine text-paper"
                                : active
                                  ? "border-pine text-pine"
                                  : "border-line-strong"
                            )}
                          >
                            <Icon
                              name={lesson.completed ? "check" : "play"}
                              size={10}
                              strokeWidth={2.2}
                            />
                          </span>

                          <span className="min-w-0 flex-1">
                            <span
                              className={cn(
                                "block text-[13px] leading-5",
                                active ? "font-medium" : ""
                              )}
                            >
                              {lesson.title}
                            </span>
                            <span className="mt-0.5 flex flex-wrap items-center gap-x-2">
                              {lesson.isPreview ? (
                                <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-muted">
                                  preview
                                </span>
                              ) : null}
                              {quiz ? (
                                <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-amber">
                                  quiz
                                  {quiz.bestScore !== null
                                    ? ` · best ${quiz.bestScore}%`
                                    : ""}
                                </span>
                              ) : null}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Course footer link */}
      <div className="border-t border-line px-5 py-4">
        <a
          href={`/courses/${courseId}`}
          className="link-underline text-[13px] text-pine hover:text-pine-deep"
        >
          Course page &amp; reviews
        </a>
      </div>
    </div>
  );
}
