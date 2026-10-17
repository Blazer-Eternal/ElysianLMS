/** Exact mirrors of GET /api/dashboard/{student,teacher,admin} payloads. */

// ---------- Student ----------

export interface StudentCourseSummary {
  id: number;
  title: string;
  slug: string;
  thumbnailUrl: string | null;
  price: number;
  status: string;
  enrolledAt: string;
  totalLessons: number;
  completedLessons: number;
  percent: number;
}

export interface ContinueLearning {
  courseId: number;
  courseTitle: string;
  sectionId: number;
  sectionTitle: string;
  lessonId: number;
  lessonTitle: string;
}

export interface PendingOrder {
  id: number;
  amount: number;
  status: string;
  createdAt: string;
  course: { id: number; title: string; slug: string };
}

export interface RecentAttempt {
  id: number;
  score: number;
  passed: boolean;
  submittedAt: string;
  quizId: number;
  quizTitle: string;
  courseId: number;
  courseTitle: string;
}

export interface UnreviewedCourse {
  id: number;
  title: string;
  slug: string;
  thumbnailUrl: string | null;
}

export interface StudentDashboard {
  summary: {
    enrolled: number;
    completed: number;
    inProgress: number;
    averageProgress: number;
  };
  courses: StudentCourseSummary[];
  continueLearning: ContinueLearning | null;
  pendingOrder: PendingOrder | null;
  quizSummary: { totalAttempts: number; passedAttempts: number; averageScore: number };
  recentAttempts: RecentAttempt[];
  unreviewedCourses: UnreviewedCourse[];
}

// ---------- Teacher ----------

export interface TeacherCourse {
  id: number;
  title: string;
  slug: string;
  status: string;
  price: number;
  thumbnailUrl: string | null;
  teacherId: number;
  teacherName: string;
  isOwner: boolean;
  updatedAt: string;
  sections: number;
  lessons: number;
  enrollments: number;
  reviewCount: number;
  reviewAverage: number;
  publishReady: boolean;
}

export interface QuizStat {
  quizId: number;
  title: string;
  passScore: number;
  courseId: number;
  attempts: number;
  passed: number;
  students: number;
  averageScore: number;
  passRate: number;
}

export interface WeakestQuestion {
  questionId: number;
  questionText: string;
  quizTitle: string;
  courseId: number;
  answers: number;
  wrong: number;
  wrongRate: number;
}

export interface RecentEnrollment {
  id: number;
  courseId: number;
  courseTitle: string;
  userName: string;
  email: string;
  enrolledAt: string;
}

export interface TeacherDashboard {
  summary: {
    totalCourses: number;
    published: number;
    pending: number;
    draft: number;
    rejected: number;
    archived: number;
    totalStudents: number;
    totalEnrollments: number;
    totalLessons: number;
  };
  courses: TeacherCourse[];
  quizAnalytics: {
    quizzes: QuizStat[];
    weakestQuestions: WeakestQuestion[];
  };
  recentEnrollments: RecentEnrollment[];
}

// ---------- Admin ----------

export interface AdminOrderStatusBucket {
  count: number;
  amount: number;
}

export interface ReviewQueueCourse {
  id: number;
  title: string;
  slug: string;
  price: number;
  teacherName: string;
  sections: number;
  lessons: number;
  updatedAt: string;
  publishReady: boolean;
}

export interface AdminOrderRow {
  id: number;
  amount: number;
  status: string;
  createdAt: string;
  userName: string;
  email: string;
  courseTitle: string;
  courseSlug: string;
}

export interface AdminUserRow {
  id: number;
  name: string;
  email: string;
  role: string;
  isBanned: boolean;
  createdAt: string;
}

export interface AdminDashboard {
  totals: {
    users: number;
    students: number;
    teachers: number;
    admins: number;
    bannedUsers: number;
    enrollments: number;
    reviews: number;
    courses: number;
    coursesByStatus: Record<string, number>;
  };
  revenue: { paid: number; refunded: number; net: number; pending: number };
  ordersByStatus: Record<string, AdminOrderStatusBucket>;
  growth: { signups7d: number; enrollments7d: number };
  reviewQueue: ReviewQueueCourse[];
  latestOrders: AdminOrderRow[];
  latestUsers: AdminUserRow[];
  riskFlags: {
    emptyContentCourses: Array<{ id: number; title: string; status: string }>;
    paidOrdersWithoutEnrollment: number;
  };
}
