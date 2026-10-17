/** GET /api/progress/course/:id — also the student's course outline. */

export interface ProgressLesson {
  id: number;
  title: string;
  orderIndex: number;
  isPreview: boolean;
  completed: boolean;
}

export interface ProgressSection {
  section: { id: number; title: string; orderIndex: number };
  lessons: ProgressLesson[];
}

export interface CourseProgress {
  totalLessons: number;
  completedLessons: number;
  percent: number;
  sections: ProgressSection[];
  quizzes: Array<{ lessonId: number; quizId: number; bestScore: number | null }>;
}

/** GET /api/lesson/:id (optionalAuth) */
export interface LessonPayload {
  lesson: {
    id: number;
    sectionId: number;
    title: string;
    videoProvider: "youtube" | "cloudinary" | null;
    videoRef: string | null;
    content: string | null;
    isPreview: boolean;
    orderIndex: number;
  };
  course: { id: number; title: string; slug: string };
  quiz: { id: number; title: string; passScore: number } | null;
}
