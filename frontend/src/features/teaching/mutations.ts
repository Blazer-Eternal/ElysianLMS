"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendVoid, toApiError } from "@/lib/api-client";
import { useToast } from "@/components/providers/toast-provider";

/**
 * Write hooks for the teaching workspace, grouped exactly like the
 * backend's route families. Every success invalidates the read hooks
 * (and dashboards) that surface the same data; every failure lands as
 * a toast unless a call site passes its own onError.
 */

function useNotifyError() {
  const { push } = useToast();
  return (error: unknown) => push(toApiError(error).message, "error");
}

/** Shared invalidation for everything a curriculum edit touches. */
function useCurriculumInvalidator(courseId: number) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["sections", courseId] });
    queryClient.invalidateQueries({ queryKey: ["course", courseId] });
    queryClient.invalidateQueries({ queryKey: ["courses", "mine"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard", "teacher"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard", "admin"] });
  };
}

/* ------------------------------- curriculum ------------------------------- */

export function useCurriculumMutations(courseId: number) {
  const invalidate = useCurriculumInvalidator(courseId);
  const onError = useNotifyError();

  const createSection = useMutation({
    mutationFn: (title: string) =>
      sendVoid({ method: "POST", url: `/course/${courseId}/sections`, data: { title } }),
    onSuccess: invalidate,
    onError,
  });

  const renameSection = useMutation({
    mutationFn: ({ id, title }: { id: number; title: string }) =>
      sendVoid({ method: "PATCH", url: `/section/${id}`, data: { title } }),
    onSuccess: invalidate,
    onError,
  });

  const deleteSection = useMutation({
    mutationFn: (id: number) => sendVoid({ method: "DELETE", url: `/section/${id}` }),
    onSuccess: invalidate,
    onError,
  });

  const moveSection = useMutation({
    mutationFn: ({ id, orderIndex }: { id: number; orderIndex: number }) =>
      sendVoid({ method: "PATCH", url: `/section/${id}/reorder`, data: { orderIndex } }),
    onSuccess: invalidate,
    onError,
  });

  const createLesson = useMutation({
    mutationFn: ({ sectionId, title }: { sectionId: number; title: string }) =>
      sendVoid({ method: "POST", url: `/section/${sectionId}/lessons`, data: { title } }),
    onSuccess: invalidate,
    onError,
  });

  const updateLesson = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: {
        title?: string;
        content?: string | null;
        videoProvider?: "youtube" | "cloudinary" | null;
        videoRef?: string | null;
        isPreview?: boolean;
      };
    }) => sendVoid({ method: "PATCH", url: `/lesson/${id}`, data }),
    onSuccess: invalidate,
    onError,
  });

  const deleteLesson = useMutation({
    mutationFn: (id: number) => sendVoid({ method: "DELETE", url: `/lesson/${id}` }),
    onSuccess: invalidate,
    onError,
  });

  const moveLesson = useMutation({
    mutationFn: ({ id, sectionId }: { id: number; sectionId: number }) =>
      sendVoid({ method: "PATCH", url: `/lesson/${id}/move`, data: { sectionId } }),
    onSuccess: invalidate,
    onError,
  });

  const reorderLesson = useMutation({
    mutationFn: ({ id, orderIndex }: { id: number; orderIndex: number }) =>
      sendVoid({ method: "PATCH", url: `/lesson/${id}/reorder`, data: { orderIndex } }),
    onSuccess: invalidate,
    onError,
  });

  return {
    createSection,
    renameSection,
    deleteSection,
    moveSection,
    createLesson,
    updateLesson,
    deleteLesson,
    moveLesson,
    reorderLesson,
  };
}

/* ---------------------------------- quiz ---------------------------------- */

export function useQuizMutations(courseId: number, lessonId?: number) {
  const invalidate = useCurriculumInvalidator(courseId);
  const queryClient = useQueryClient();
  const onError = useNotifyError();

  const invalidateQuiz = (quizId?: number) => {
    invalidate();
    if (lessonId) queryClient.invalidateQueries({ queryKey: ["lesson", lessonId] });
    if (quizId) queryClient.invalidateQueries({ queryKey: ["staff-quiz", quizId] });
  };

  const createQuiz = useMutation({
    mutationFn: ({
      lessonId: target,
      title,
      passScore,
    }: {
      lessonId: number;
      title: string;
      passScore: number;
    }) =>
      sendVoid({
        method: "POST",
        url: "/quiz",
        data: { lessonId: target, title, passScore },
      }),
    onSuccess: () => invalidateQuiz(),
    onError,
  });

  const updateQuiz = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: { title?: string; passScore?: number };
    }) => sendVoid({ method: "PATCH", url: `/quiz/${id}`, data }),
    onSuccess: (_data, variables) => invalidateQuiz(variables.id),
    onError,
  });

  const deleteQuiz = useMutation({
    mutationFn: (id: number) => sendVoid({ method: "DELETE", url: `/quiz/${id}` }),
    onSuccess: (_data: unknown, id: number) => invalidateQuiz(id),
    onError,
  });

  const addQuestion = useMutation({
    mutationFn: ({
      quizId,
      data,
    }: {
      quizId: number;
      data: {
        questionText: string;
        orderIndex?: number;
        options: Array<{ optionText: string; isCorrect?: boolean }>;
      };
    }) => sendVoid({ method: "POST", url: `/quiz/${quizId}/questions`, data }),
    onSuccess: (_data, variables) => invalidateQuiz(variables.quizId),
    onError,
  });

  const updateQuestion = useMutation({
    mutationFn: ({
      questionId,
      data,
    }: {
      questionId: number;
      quizId: number;
      data: {
        questionText?: string;
        options?: Array<{ optionText: string; isCorrect?: boolean }>;
      };
    }) => sendVoid({ method: "PATCH", url: `/quiz/question/${questionId}`, data }),
    onSuccess: (_data, variables) => invalidateQuiz(variables.quizId),
    onError,
  });

  const deleteQuestion = useMutation({
    mutationFn: ({ questionId }: { questionId: number; quizId: number }) =>
      sendVoid({ method: "DELETE", url: `/quiz/question/${questionId}` }),
    onSuccess: (_data, variables) => invalidateQuiz(variables.quizId),
    onError,
  });

  return { createQuiz, updateQuiz, deleteQuiz, addQuestion, updateQuestion, deleteQuestion };
}

/* ---------------------------- course details/status ---------------------------- */

export type CourseStatusValue =
  | "draft"
  | "pending"
  | "published"
  | "rejected"
  | "archived";

export function useCourseDetailMutations(courseId: number) {
  const invalidate = useCurriculumInvalidator(courseId);
  const onError = useNotifyError();

  const updateCourse = useMutation({
    mutationFn: (data: {
      title?: string;
      description?: string;
      price?: number;
      thumbnailUrl?: string | null;
      categoryId?: number | null;
    }) => sendVoid({ method: "PATCH", url: `/course/${courseId}`, data }),
    onSuccess: invalidate,
    onError,
  });

  const updateStatus = useMutation({
    mutationFn: (status: CourseStatusValue) =>
      sendVoid({ method: "PATCH", url: `/course/${courseId}/status`, data: { status } }),
    onSuccess: invalidate,
    onError,
  });

  return { updateCourse, updateStatus };
}

/* --------------------------------- staff ---------------------------------- */

export function useStaffMutations(courseId: number) {
  const queryClient = useQueryClient();
  const onError = useNotifyError();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["course-staff", courseId] });
    queryClient.invalidateQueries({ queryKey: ["dashboard", "teacher"] });
  };

  const addStaff = useMutation({
    mutationFn: ({ userId, staffRole }: { userId: number; staffRole: "ta" | "co_teacher" }) =>
      sendVoid({
        method: "POST",
        url: `/course/${courseId}/staff`,
        data: { userId, staffRole },
      }),
    onSuccess: invalidate,
    onError,
  });

  const updateStaff = useMutation({
    mutationFn: ({ userId, staffRole }: { userId: number; staffRole: "ta" | "co_teacher" }) =>
      sendVoid({
        method: "PATCH",
        url: `/course/${courseId}/staff/${userId}`,
        data: { staffRole },
      }),
    onSuccess: invalidate,
    onError,
  });

  const removeStaff = useMutation({
    mutationFn: (userId: number) =>
      sendVoid({ method: "DELETE", url: `/course/${courseId}/staff/${userId}` }),
    onSuccess: invalidate,
    onError,
  });

  return { addStaff, updateStaff, removeStaff };
}
