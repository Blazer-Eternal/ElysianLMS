"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import type { CourseProgress } from "@/types/progress";

/**
 * Curriculum outline for enrolled students. The staff section/lesson
 * endpoints are staff-only, so students read structure from
 * GET /progress/course/:id — completion flags come along for free.
 */
export function CurriculumSection({
  courseId,
  progress,
}: {
  courseId: number;
  progress: CourseProgress;
}) {
  const quizzesByLesson = new Map(progress.quizzes.map((quiz) => [quiz.lessonId, quiz]));

  return (
    <section>
      <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
        <h2 className="font-display text-2xl font-semibold text-ink">Curriculum</h2>
        <span className="font-mono text-[11px] uppercase tracking-widest text-ink-muted">
          {progress.completedLessons}/{progress.totalLessons} complete
        </span>
      </div>

      {progress.sections.length === 0 ? (
        <p className="pt-4 text-sm text-ink-muted">
          This course has no sections yet, which means it should not have
          been published. Check back soon.
        </p>
      ) : (
        <ol className="flex flex-col gap-5 pt-5">
          {progress.sections.map((section, sectionIndex) => (
            <li key={section.section.id}>
              <p className="flex items-center gap-3 pb-2">
                <span className="font-mono text-xs text-pine">
                  {String(sectionIndex + 1).padStart(2, "0")}
                </span>
                <span className="text-sm font-semibold text-ink">
                  {section.section.title}
                </span>
                <span className="font-mono text-[11px] text-ink-muted">
                  {section.lessons.length} {section.lessons.length === 1 ? "lesson" : "lessons"}
                </span>
              </p>

              <ul className="overflow-hidden rounded-card border border-line bg-surface">
                {section.lessons.map((lesson) => {
                  const quiz = quizzesByLesson.get(lesson.id);
                  return (
                    <li key={lesson.id} className="border-b border-line last:border-b-0">
                      <Link
                        href={`/learn/${courseId}?lesson=${lesson.id}`}
                        className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-muted/70"
                      >
                        <span
                          aria-hidden
                          className={
                            lesson.completed
                              ? "flex size-6 shrink-0 items-center justify-center rounded-full bg-pine text-paper"
                              : "flex size-6 shrink-0 items-center justify-center rounded-full border border-line-strong text-ink-muted"
                          }
                        >
                          <Icon
                            name={lesson.completed ? "check" : "play"}
                            size={12}
                            strokeWidth={2}
                          />
                        </span>

                        <span className="min-w-0 flex-1 truncate text-sm text-ink">
                          {lesson.title}
                        </span>

                        {lesson.isPreview ? (
                          <span className="shrink-0 rounded-full border border-line-strong px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-muted">
                            preview
                          </span>
                        ) : null}

                        {quiz ? (
                          <span className="flex shrink-0 items-center gap-1 font-mono text-[10px] uppercase tracking-[0.08em] text-amber">
                            <Icon name="document" size={12} />
                            quiz
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
