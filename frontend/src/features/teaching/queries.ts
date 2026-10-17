"use client";

import { useQuery } from "@tanstack/react-query";
import { getData } from "@/lib/api-client";
import type { ApiError } from "@/types/api";
import type { Course } from "@/types/course";
import type {
  CourseStaffMember,
  StaffQuizPayload,
  TeachingSection,
} from "@/types/teaching";

export function useSections(courseId: number) {
  return useQuery({
    queryKey: ["sections", courseId],
    queryFn: () =>
      getData<TeachingSection[]>({ method: "GET", url: `/course/${courseId}/sections` }),
    enabled: Number.isFinite(courseId),
    retry: false,
  });
}

export function useMyCourses(enabled: boolean) {
  return useQuery({
    queryKey: ["courses", "mine"],
    queryFn: () => getData<Course[]>({ method: "GET", url: "/course/mine" }),
    enabled,
  });
}

export function useCourseStaff(courseId: number) {
  return useQuery({
    queryKey: ["course-staff", courseId],
    queryFn: () =>
      getData<CourseStaffMember[]>({ method: "GET", url: `/course/${courseId}/staff` }),
    enabled: Number.isFinite(courseId),
    retry: false,
  });
}

export function useStaffQuiz(quizId: number, enabled: boolean) {
  return useQuery({
    queryKey: ["staff-quiz", quizId],
    queryFn: () => getData<StaffQuizPayload>({ method: "GET", url: `/quiz/${quizId}/staff` }),
    enabled: enabled && Number.isFinite(quizId),
    retry: false,
  });
}

/**
 * Workspace course record. Owners read drafts through /course/mine;
 * staff members (whose courses may be missing there) fall back to the
 * public endpoint, which works for published courses.
 */
export function useWorkspaceCourse(courseId: number, isOwnerScope: boolean) {
  const mine = useMyCourses(isOwnerScope);
  const published = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => getData<Course>({ method: "GET", url: `/course/${courseId}` }),
    enabled: Number.isFinite(courseId),
    retry: false,
  });

  const fromMine = mine.data?.find((course) => course.id === courseId);
  const course = fromMine ?? (mine.isError || !isOwnerScope ? published.data : undefined);

  return {
    course: course ?? null,
    isLoading:
      Number.isFinite(courseId) && !fromMine && (mine.isLoading || published.isLoading),
    error: (mine.error ?? published.error) as ApiError | null,
    refetch: () => {
      mine.refetch();
      published.refetch();
    },
  };
}
