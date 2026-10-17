/** Payloads for the teaching workspace (staff-facing endpoints). */

export type StaffRole = "ta" | "co_teacher";

export interface TeachingLesson {
  id: number;
  sectionId: number;
  title: string;
  videoProvider: "youtube" | "cloudinary" | null;
  videoRef: string | null;
  content: string | null;
  isPreview: boolean;
  orderIndex: number;
}

export interface TeachingSection {
  id: number;
  courseId: number;
  title: string;
  orderIndex: number;
  lessons: TeachingLesson[];
}

export interface CourseStaffMember {
  id: number;
  courseId: number;
  userId: number;
  staffRole: StaffRole;
  assignedAt: string;
  user: { id: number; name: string; email: string; avatarUrl: string | null };
}

/** GET /quiz/:id/staff — the only view carrying isCorrect. */
export interface StaffQuizQuestionOption {
  id: number;
  optionText: string;
  isCorrect: boolean;
}

export interface StaffQuizQuestion {
  id: number;
  quizId: number;
  questionText: string;
  orderIndex: number;
  options: StaffQuizQuestionOption[];
}

export interface StaffQuizPayload {
  quiz: { id: number; lessonId: number; title: string; passScore: number };
  questions: StaffQuizQuestion[];
}
