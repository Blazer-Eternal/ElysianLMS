/** Quiz payloads (student-facing and attempt records). */

export interface QuizAttempt {
  id: number;
  quizId: number;
  userId: number;
  score: number;
  passed: boolean;
  submittedAt: string;
}

export interface QuizOption {
  id: number;
  optionText: string;
}

export interface QuizQuestion {
  id: number;
  quizId: number;
  questionText: string;
  orderIndex: number;
  options: QuizOption[];
}

/** GET /api/quiz/:id — correctness is never sent before submission. */
export interface StudentQuiz {
  quiz: { id: number; lessonId: number; title: string; passScore: number };
  questions: QuizQuestion[];
  previousAttempts: QuizAttempt[];
  bestScore: number | null;
}

/** POST /api/quiz/:id/attempts response. */
export interface AttemptSubmission {
  attempt: QuizAttempt;
  answers: Array<{ id: number; attemptId: number; questionId: number; optionId: number | null }>;
}
