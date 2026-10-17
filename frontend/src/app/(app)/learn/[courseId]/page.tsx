"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  defaultLessonId,
  flattenLessons,
  useCourseProgressQuery,
  useLesson,
  useLessonProgressMutation,
} from "@/features/learn/queries";
import { OutlineSidebar } from "@/features/learn/outline-sidebar";
import { LessonView } from "@/features/learn/lesson-view";
import { useToast } from "@/components/providers/toast-provider";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState, ErrorState, Skeleton, Spinner } from "@/components/ui/primitives";
import { ApiError } from "@/types/api";

/**
 * Course player. The outline comes from the progress endpoint (the only
 * curriculum view students have), the active lesson is URL state, and
 * every transition is a navigation so back/forward walks the lessons.
 */
export default function LearnPage() {
  return (
    <Suspense fallback={<LearnSkeleton />}>
      <LearnInner />
    </Suspense>
  );
}

function LearnInner() {
  const params = useParams<{ courseId: string }>();
  const courseId = Number(params.courseId);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { push } = useToast();

  const progressQuery = useCourseProgressQuery(courseId);

  const lessonParam = searchParams.get("lesson");
  const explicitId = lessonParam ? Number(lessonParam) : null;
  const progress = progressQuery.data;

  // Selection = URL param when present, else the resume point derived
  // from progress. Once resolved, the URL is normalized to it (a
  // navigation, not a state update), which pins the selection so later
  // progress changes cannot move the active lesson.
  const activeId = explicitId ?? (progress ? defaultLessonId(progress) : null);

  useEffect(() => {
    if (explicitId === null && activeId !== null && Number.isFinite(activeId)) {
      router.replace(`/learn/${courseId}?lesson=${activeId}`, { scroll: false });
    }
  }, [explicitId, activeId, courseId, router]);

  const lessonQuery = useLesson(activeId ?? 0, activeId !== null);

  const [outlineOpen, setOutlineOpen] = useState(false);
  const mutations = useLessonProgressMutation(courseId);

  const toggleComplete = (currentlyCompleted: boolean) => {
    const lessonId = activeId;
    if (lessonId === null) return;
    const mutation = currentlyCompleted ? mutations.markIncomplete : mutations.markComplete;
    mutation.mutate(lessonId, {
      onSuccess: () => {
        if (!currentlyCompleted) push("Lesson marked complete.", "success");
      },
      onError: (error) => {
        const apiError = error instanceof ApiError ? error : null;
        push(
          apiError?.status === 403
            ? "Only enrolled students can record progress."
            : apiError?.message ?? "Could not save progress. Try again.",
          "error"
        );
      },
    });
  };

  /* --------------------------- access & loading --------------------------- */

  if (progressQuery.isLoading) return <LearnSkeleton />;

  if (progressQuery.isError || !progress) {
    const error = progressQuery.error;
    const status = error instanceof ApiError ? error.status : null;

    if (status === 403) {
      return (
        <div className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center px-4 py-16">
          <EmptyState
            icon="lock"
            title="You are not enrolled"
            description="Open the course page to enroll (free courses open instantly), then your lessons and progress appear here."
            action={
              <ButtonLink href={`/courses/${courseId}`} iconEnd="arrow-right">
                Open course page
              </ButtonLink>
            }
          />
        </div>
      );
    }

    return (
      <div className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center px-4 py-16">
        <ErrorState
          title="Course unavailable"
          description={
            status === 404
              ? "This course no longer exists, or it was unarchived after you enrolled."
              : error instanceof ApiError
                ? error.message
                : "Could not load your course outline."
          }
          action={
            <Button
              variant="secondary"
              size="sm"
              iconStart="refresh"
              onClick={() => progressQuery.refetch()}
            >
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  if (activeId === null) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center px-4 py-16">
        <EmptyState
          icon="book"
          title="No lessons yet"
          description="Your enrollment is recorded, but this course has no lessons to open. Check back when the instructor publishes content."
          action={
            <ButtonLink href={`/courses/${courseId}`} variant="secondary">
              Course page
            </ButtonLink>
          }
        />
      </div>
    );
  }

  const lessons = flattenLessons(progress);
  const position = lessons.findIndex((lesson) => lesson.lessonId === activeId);
  const current = position >= 0 ? lessons[position] : null;
  const prev = position > 0 ? lessons[position - 1] : null;
  const next = position >= 0 && position < lessons.length - 1 ? lessons[position + 1] : null;

  const navigateTo = (lessonId: number) => {
    setOutlineOpen(false);
    router.push(`/learn/${courseId}?lesson=${lessonId}`);
  };

  const activeLessonId = activeId;
  const courseTitle = lessonQuery.data?.course.title;

  /* -------------------------------- render -------------------------------- */

  return (
    <div className="grid min-h-dvh lg:grid-cols-[19rem_1fr]">
      {/* Desktop outline */}
      <aside className="sticky top-0 hidden h-dvh border-r border-line bg-surface lg:block">
        <OutlineSidebar
          courseId={courseId}
          progress={progress}
          activeLessonId={activeLessonId}
          courseTitle={courseTitle}
          onSelect={navigateTo}
          className="h-full"
        />
      </aside>

      {/* Lesson column */}
      <main className="min-w-0">
        {/* Mobile outline bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-line bg-paper px-4 py-3 lg:hidden">
          <span className="min-w-0 truncate font-display text-[15px] font-semibold text-ink">
            {courseTitle ?? "Course"}
          </span>
          <Button
            variant="secondary"
            size="sm"
            iconStart="layers"
            onClick={() => setOutlineOpen((open) => !open)}
            aria-expanded={outlineOpen}
          >
            Outline
          </Button>
        </div>

        {outlineOpen ? (
          <div className="max-h-[70vh] overflow-y-auto border-b border-line bg-surface lg:hidden">
            <OutlineSidebar
              courseId={courseId}
              progress={progress}
              activeLessonId={activeLessonId}
              courseTitle={courseTitle}
              onSelect={navigateTo}
            />
          </div>
        ) : null}

        <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
          {lessonQuery.isLoading ? (
            <div className="flex flex-col gap-5">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="aspect-video w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : lessonQuery.isError || !lessonQuery.data ? (
            <LessonError
              error={lessonQuery.error}
              onBack={() => navigateTo(lessons[0]?.lessonId ?? activeId)}
              courseId={courseId}
            />
          ) : (
            <LessonView
              courseId={courseId}
              payload={lessonQuery.data}
              completed={current?.completed ?? false}
              bestScore={
                progress.quizzes.find((quiz) => quiz.lessonId === activeId)?.bestScore ??
                null
              }
              completeBusy={mutations.markComplete.isPending || mutations.markIncomplete.isPending}
              onToggleComplete={toggleComplete}
              prev={prev}
              next={next}
              onNavigate={navigateTo}
            />
          )}
        </div>
      </main>
    </div>
  );
}

function LessonError({
  error,
  onBack,
  courseId,
}: {
  error: unknown;
  onBack: () => void;
  courseId: number;
}) {
  const status = error instanceof ApiError ? error.status : null;

  if (status === 403) {
    return (
      <EmptyState
        icon="lock"
        title="Lesson locked"
        description="This lesson is only open to enrolled students. Preview lessons and the course page stay public."
        action={
          <div className="flex flex-wrap justify-center gap-2.5">
            <ButtonLink href={`/courses/${courseId}`} iconEnd="arrow-right">
              Open course page
            </ButtonLink>
            <Button variant="secondary" size="sm" onClick={onBack}>
              Back to first lesson
            </Button>
          </div>
        }
      />
    );
  }

  return (
    <ErrorState
      title={status === 404 ? "Lesson not found" : "Lesson unavailable"}
      description={
        status === 404
          ? "This lesson was removed or moved. Pick another from the outline."
          : error instanceof ApiError
            ? error.message
            : "Could not load this lesson."
      }
      action={
        <Button variant="secondary" size="sm" onClick={onBack}>
          Back to outline
        </Button>
      }
    />
  );
}

function LearnSkeleton() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[19rem_1fr]">
      <aside className="sticky top-0 hidden h-dvh border-r border-line bg-surface p-5 lg:block">
        <div className="flex flex-col gap-3">
          <Spinner label="Loading course" />
          <Skeleton className="mt-4 h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-3/5" />
        </div>
      </aside>
      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-5">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="aspect-video w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </main>
    </div>
  );
}
