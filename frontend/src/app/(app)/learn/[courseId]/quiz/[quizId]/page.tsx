"use client";

import { useParams } from "next/navigation";
import { QuizPlayer } from "@/features/learn/quiz-player";

/**
 * Focused quiz route inside the player shell. Focus mode: the outline
 * steps aside so the attempt gets the whole attention.
 */
export default function QuizPage() {
  const params = useParams<{ courseId: string; quizId: string }>();
  const courseId = Number(params.courseId);
  const quizId = Number(params.quizId);

  return (
    <QuizPlayer courseId={courseId} quizId={quizId} />
  );
}
