"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, getData, sendData, sendVoid } from "@/lib/api-client";
import type { ApiEnvelope } from "@/types/api";
import type { Course, Review, ReviewSummary } from "@/types/course";
import type { CourseProgress } from "@/types/progress";

export function useCourse(courseId: number) {
  return useQuery({
    queryKey: ["course", courseId],
    queryFn: () => getData<Course>({ method: "GET", url: `/course/${courseId}` }),
    enabled: Number.isFinite(courseId),
  });
}

/**
 * Reviews keep `summary` as a top-level sibling of `data`, so the whole
 * envelope is read here too.
 */
export function useCourseReviews(courseId: number) {
  return useQuery({
    queryKey: ["course", courseId, "reviews"],
    queryFn: async () => {
      const response = await apiClient.get<ApiEnvelope<Review[]> & { summary: ReviewSummary }>(
        `/course/${courseId}/reviews`
      );
      return {
        reviews: response.data.data ?? [],
        summary: response.data.summary ?? { average: 0, count: 0 },
      };
    },
    enabled: Number.isFinite(courseId),
  });
}

/** Outline + per-lesson completion. 403s silently when not enrolled. */
export function useCourseProgress(courseId: number, enabled: boolean) {
  return useQuery({
    queryKey: ["course", courseId, "progress"],
    queryFn: () => getData<CourseProgress>({ method: "GET", url: `/progress/course/${courseId}` }),
    enabled: enabled && Number.isFinite(courseId),
    retry: false,
  });
}

export function useReviewMutation(courseId: number) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["course", courseId, "reviews"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard", "student"] });
  };

  const create = useMutation({
    mutationFn: (input: { rating: number; comment: string | null }) =>
      sendVoid({
        method: "POST",
        url: "/review",
        data: { courseId, rating: input.rating, comment: input.comment },
      }),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: (input: { id: number; rating: number; comment: string | null }) =>
      sendVoid({
        method: "PATCH",
        url: `/review/${input.id}`,
        data: { rating: input.rating, comment: input.comment },
      }),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => sendVoid({ method: "DELETE", url: `/review/${id}` }),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}

/** Kept for the detail page's own-review detection. */
export function useMyReview(courseId: number, userId: number | undefined) {
  const reviews = useCourseReviews(courseId);
  const mine = userId
    ? reviews.data?.reviews.find((review) => review.userId === userId) ?? null
    : null;
  return { ...reviews, mine };
}

/** Enroll / order helpers used by the action panel. */
export function useEnrollActions(courseId: number) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["course", courseId, "progress"] });
    queryClient.invalidateQueries({ queryKey: ["orders"] });
  };

  const enroll = useMutation({
    mutationFn: () => sendVoid({ method: "POST", url: "/enrollment", data: { courseId } }),
    onSuccess: invalidate,
  });

  const createOrder = useMutation({
    mutationFn: (gateway: "esewa" | "khalti") =>
      sendData<{ id: number }>({
        method: "POST",
        url: "/order",
        data: { courseId, gateway },
      }),
    onSuccess: invalidate,
  });

  return { enroll, createOrder };
}
