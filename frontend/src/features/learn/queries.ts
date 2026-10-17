"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getData, sendVoid } from "@/lib/api-client";
import type { CourseProgress, LessonPayload } from "@/types/progress";

export function useCourseProgressQuery(courseId: number) {
  return useQuery({
    queryKey: ["course", courseId, "progress"],
    queryFn: () => getData<CourseProgress>({ method: "GET", url: `/progress/course/${courseId}` }),
    enabled: Number.isFinite(courseId),
    retry: false,
  });
}

export function useLesson(lessonId: number, enabled: boolean) {
  return useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: () => getData<LessonPayload>({ method: "GET", url: `/lesson/${lessonId}` }),
    enabled: enabled && Number.isFinite(lessonId) && lessonId > 0,
    retry: false,
  });
}

/** Complete / un-complete a lesson; both directions live here. */
export function useLessonProgressMutation(courseId: number) {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["course", courseId, "progress"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };

  const markComplete = useMutation({
    mutationFn: (lessonId: number) =>
      sendVoid({ method: "POST", url: "/progress/complete", data: { lessonId } }),
    onSuccess: invalidate,
  });

  const markIncomplete = useMutation({
    mutationFn: (lessonId: number) =>
      sendVoid({ method: "POST", url: "/progress/incomplete", data: { lessonId } }),
    onSuccess: invalidate,
  });

  return { markComplete, markIncomplete };
}

/* ------------------------------ outline helpers ----------------------------- */

export interface FlatLesson {
  lessonId: number;
  title: string;
  completed: boolean;
  isPreview: boolean;
  sectionId: number;
  sectionTitle: string;
}

/** Lessons in reading order, for prev/next navigation and defaults. */
export function flattenLessons(progress: CourseProgress): FlatLesson[] {
  const sorted = [...progress.sections].sort(
    (a, b) => a.section.orderIndex - b.section.orderIndex
  );
  return sorted.flatMap((section) =>
    [...section.lessons]
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((lesson) => ({
        lessonId: lesson.id,
        title: lesson.title,
        completed: lesson.completed,
        isPreview: lesson.isPreview,
        sectionId: section.section.id,
        sectionTitle: section.section.title,
      }))
  );
}

/** Resume point: first unfinished lesson, else the very first. */
export function defaultLessonId(progress: CourseProgress): number | null {
  const lessons = flattenLessons(progress);
  if (lessons.length === 0) return null;
  return lessons.find((lesson) => !lesson.completed)?.lessonId ?? lessons[0].lessonId;
}

/** YouTube refs arrive as bare ids or any watch/shorts/youtu.be URL. */
export function youtubeEmbedUrl(ref: string): string | null {
  const trimmed = ref.trim();
  if (!trimmed) return null;
  if (!/^https?:\/\//i.test(trimmed)) {
    return /^[A-Za-z0-9_-]{6,}$/.test(trimmed)
      ? `https://www.youtube-nocookie.com/embed/${trimmed}`
      : null;
  }
  try {
    const url = new URL(trimmed);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = url.pathname.slice(1);
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    if (host.endsWith("youtube.com")) {
      const fromQuery = url.searchParams.get("v");
      if (fromQuery) return `https://www.youtube.com/embed/${fromQuery}`;
      const segments = url.pathname.split("/").filter(Boolean);
      const marker = segments.findIndex((part) => part === "embed" || part === "shorts");
      const id = marker >= 0 ? segments[marker + 1] : null;
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    return null;
  } catch {
    return null;
  }
}
