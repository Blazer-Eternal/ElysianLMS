import { QueryTypes } from "sequelize";
import { Database } from "../config";
import { CourseStatusEnum } from "../enums/courseStatusEnum";
import { OrderStatusEnum } from "../enums/orderStatusEnum";
import { RoleEnum } from "../enums/roleEnum";

// Dashboard reads are aggregates across several tables; SQL keeps them to a
// handful of round trips instead of N+1 loops. Every value travels through
// named replacements — identifiers in these strings are always static.
// Counters are cast ::int (pg returns bigint as string); money/averages come
// back as numeric strings and are converted in the service layer.

export interface StudentCourseRow {
  id: number;
  title: string;
  slug: string;
  thumbnailUrl: string | null;
  price: string;
  status: CourseStatusEnum;
  enrolledAt: Date;
  totalLessons: number;
  completedLessons: number;
}

export interface CourseOutlineRow {
  courseId: number;
  sectionId: number;
  sectionTitle: string;
  lessonId: number;
  lessonTitle: string;
}

export interface PendingOrderRow {
  id: number;
  amount: string;
  status: OrderStatusEnum;
  createdAt: Date;
  courseId: number;
  courseTitle: string;
  courseSlug: string;
}

export interface RecentAttemptRow {
  id: number;
  score: number;
  passed: boolean;
  submittedAt: Date;
  quizId: number;
  quizTitle: string;
  courseId: number;
  courseTitle: string;
}

export interface QuizSummaryRow {
  total: number;
  passed: number;
  averageScore: number;
}

export interface UnreviewedCourseRow {
  id: number;
  title: string;
  slug: string;
  thumbnailUrl: string | null;
}

export interface ManagedCourseRow {
  id: number;
  title: string;
  slug: string;
  status: CourseStatusEnum;
  price: string;
  thumbnailUrl: string | null;
  teacherId: number;
  teacherName: string;
  updatedAt: Date;
  sections: number;
  lessons: number;
  enrollments: number;
  reviewCount: number;
  reviewAverage: number;
}

export interface StatusCountRow {
  status: CourseStatusEnum;
  count: number;
}

export interface EnrollmentTotalsRow {
  students: number;
  enrollments: number;
}

export interface QuizStatRow {
  quizId: number;
  title: string;
  passScore: number;
  courseId: number;
  attempts: number;
  passed: number;
  students: number;
  averageScore: number;
}

export interface WeakQuestionRow {
  questionId: number;
  questionText: string;
  quizTitle: string;
  courseId: number;
  answers: number;
  wrong: number;
}

export interface RecentEnrollmentRow {
  id: number;
  courseId: number;
  enrolledAt: Date;
  userName: string;
  email: string;
  courseTitle: string;
}

export interface PlatformTotalsRow {
  users: number;
  students: number;
  teachers: number;
  admins: number;
  banned: number;
  enrollments: number;
  reviews: number;
}

export interface OrderStatRow {
  status: OrderStatusEnum;
  count: number;
  amount: string;
}

export interface GrowthRow {
  signups7d: number;
  enrollments7d: number;
}

export interface ReviewQueueRow {
  id: number;
  title: string;
  slug: string;
  price: string;
  updatedAt: Date;
  teacherName: string;
  sections: number;
  lessons: number;
}

export interface LatestOrderRow {
  id: number;
  amount: string;
  status: OrderStatusEnum;
  createdAt: Date;
  userName: string;
  email: string;
  courseTitle: string;
  courseSlug: string;
}

export interface LatestUserRow {
  id: number;
  name: string;
  email: string;
  role: RoleEnum;
  isBanned: boolean;
  createdAt: Date;
}

export interface EmptyCourseRow {
  id: number;
  title: string;
  status: CourseStatusEnum;
}

export class DashboardRepository {
  // ---------- Student ----------

  public async getStudentCourses(userId: number): Promise<StudentCourseRow[]> {
    return Database.sequelize.query<StudentCourseRow>(
      `
      SELECT
        c.id,
        c.title,
        c.slug,
        c.thumbnail_url AS "thumbnailUrl",
        c.price,
        c.status,
        e.enrolled_at AS "enrolledAt",
        COALESCE(t."totalLessons", 0) AS "totalLessons",
        COALESCE(t."completedLessons", 0) AS "completedLessons"
      FROM enrollments e
      JOIN courses c ON c.id = e.course_id
      LEFT JOIN (
        SELECT
          s.course_id,
          count(l.id)::int AS "totalLessons",
          count(p.id)::int AS "completedLessons"
        FROM sections s
        JOIN lessons l ON l.section_id = s.id
        LEFT JOIN progress p ON p.lesson_id = l.id AND p.user_id = :userId
        GROUP BY s.course_id
      ) t ON t.course_id = e.course_id
      WHERE e.user_id = :userId
      ORDER BY e.enrolled_at DESC
      `,
      { replacements: { userId }, type: QueryTypes.SELECT }
    );
  }

  // Ordered outline of the candidate courses for the "continue learning" pick.
  // Grouping by courseId in the service preserves enrollment recency.
  public async getCourseOutline(courseIds: number[]): Promise<CourseOutlineRow[]> {
    if (courseIds.length === 0) return [];
    return Database.sequelize.query<CourseOutlineRow>(
      `
      SELECT
        s.course_id AS "courseId",
        s.id AS "sectionId",
        s.title AS "sectionTitle",
        l.id AS "lessonId",
        l.title AS "lessonTitle"
      FROM sections s
      JOIN lessons l ON l.section_id = s.id
      WHERE s.course_id IN (:courseIds)
      ORDER BY s.course_id, s.order_index, l.order_index
      `,
      { replacements: { courseIds }, type: QueryTypes.SELECT }
    );
  }

  public async getLatestPendingOrder(userId: number): Promise<PendingOrderRow | null> {
    const rows = await Database.sequelize.query<PendingOrderRow>(
      `
      SELECT
        o.id,
        o.amount,
        o.status,
        o.created_at AS "createdAt",
        c.id AS "courseId",
        c.title AS "courseTitle",
        c.slug AS "courseSlug"
      FROM orders o
      JOIN courses c ON c.id = o.course_id
      WHERE o.user_id = :userId AND o.status = :status
      ORDER BY o.created_at DESC
      LIMIT 1
      `,
      { replacements: { userId, status: OrderStatusEnum.pending }, type: QueryTypes.SELECT }
    );
    return rows[0] ?? null;
  }

  public async getRecentAttempts(userId: number, limit: number): Promise<RecentAttemptRow[]> {
    return Database.sequelize.query<RecentAttemptRow>(
      `
      SELECT
        qa.id,
        qa.score,
        qa.passed,
        qa.submitted_at AS "submittedAt",
        qz.id AS "quizId",
        qz.title AS "quizTitle",
        c.id AS "courseId",
        c.title AS "courseTitle"
      FROM quiz_attempts qa
      JOIN quizzes qz ON qz.id = qa.quiz_id
      JOIN lessons l ON l.id = qz.lesson_id
      JOIN sections s ON s.id = l.section_id
      JOIN courses c ON c.id = s.course_id
      WHERE qa.user_id = :userId
      ORDER BY qa.submitted_at DESC
      LIMIT :limit
      `,
      { replacements: { userId, limit }, type: QueryTypes.SELECT }
    );
  }

  public async getQuizSummary(userId: number): Promise<QuizSummaryRow> {
    const rows = await Database.sequelize.query<QuizSummaryRow>(
      `
      SELECT
        count(*)::int AS total,
        (count(*) FILTER (WHERE passed))::int AS passed,
        COALESCE(round(avg(score)), 0)::int AS "averageScore"
      FROM quiz_attempts
      WHERE user_id = :userId
      `,
      { replacements: { userId }, type: QueryTypes.SELECT }
    );
    return rows[0];
  }

  public async getUnreviewedCourses(userId: number, limit: number): Promise<UnreviewedCourseRow[]> {
    return Database.sequelize.query<UnreviewedCourseRow>(
      `
      SELECT c.id, c.title, c.slug, c.thumbnail_url AS "thumbnailUrl"
      FROM enrollments e
      JOIN courses c ON c.id = e.course_id
      LEFT JOIN reviews r ON r.user_id = e.user_id AND r.course_id = e.course_id
      WHERE e.user_id = :userId AND r.id IS NULL
      ORDER BY e.enrolled_at DESC
      LIMIT :limit
      `,
      { replacements: { userId, limit }, type: QueryTypes.SELECT }
    );
  }

  // ---------- Teacher (owner OR course_staff — the TA path) ----------

  public async getManagedCourseIds(userId: number): Promise<number[]> {
    const rows = await Database.sequelize.query<{ id: number }>(
      `
      SELECT id FROM courses WHERE teacher_id = :userId
      UNION
      SELECT course_id AS id FROM course_staff WHERE user_id = :userId
      `,
      { replacements: { userId }, type: QueryTypes.SELECT }
    );
    return rows.map((r) => r.id);
  }

  public async getManagedCourses(courseIds: number[]): Promise<ManagedCourseRow[]> {
    if (courseIds.length === 0) return [];
    return Database.sequelize.query<ManagedCourseRow>(
      `
      SELECT
        c.id,
        c.title,
        c.slug,
        c.status,
        c.price,
        c.thumbnail_url AS "thumbnailUrl",
        c.teacher_id AS "teacherId",
        u.name AS "teacherName",
        c.updated_at AS "updatedAt",
        (SELECT count(*) FROM sections s WHERE s.course_id = c.id)::int AS sections,
        (SELECT count(*) FROM sections s JOIN lessons l ON l.section_id = s.id WHERE s.course_id = c.id)::int AS lessons,
        (SELECT count(*) FROM enrollments e WHERE e.course_id = c.id)::int AS enrollments,
        (SELECT count(*) FROM reviews r WHERE r.course_id = c.id)::int AS "reviewCount",
        COALESCE((SELECT round(avg(r.rating), 1) FROM reviews r WHERE r.course_id = c.id), 0) AS "reviewAverage"
      FROM courses c
      JOIN users u ON u.id = c.teacher_id
      WHERE c.id IN (:courseIds)
      ORDER BY c.updated_at DESC
      `,
      { replacements: { courseIds }, type: QueryTypes.SELECT }
    );
  }

  public async getCourseStatusCounts(courseIds?: number[]): Promise<StatusCountRow[]> {
    if (courseIds && courseIds.length === 0) return [];
    const where = courseIds ? "WHERE id IN (:courseIds)" : "";
    const replacements = courseIds ? { courseIds } : {};
    return Database.sequelize.query<StatusCountRow>(
      `SELECT status, count(*)::int AS count FROM courses ${where} GROUP BY status`,
      { replacements, type: QueryTypes.SELECT }
    );
  }

  public async getEnrollmentTotals(courseIds: number[]): Promise<EnrollmentTotalsRow> {
    if (courseIds.length === 0) return { students: 0, enrollments: 0 };
    const rows = await Database.sequelize.query<EnrollmentTotalsRow>(
      `
      SELECT
        count(DISTINCT user_id)::int AS students,
        count(*)::int AS enrollments
      FROM enrollments
      WHERE course_id IN (:courseIds)
      `,
      { replacements: { courseIds }, type: QueryTypes.SELECT }
    );
    return rows[0];
  }

  public async getQuizStats(courseIds: number[]): Promise<QuizStatRow[]> {
    if (courseIds.length === 0) return [];
    return Database.sequelize.query<QuizStatRow>(
      `
      SELECT
        qz.id AS "quizId",
        qz.title,
        qz.pass_score AS "passScore",
        s.course_id AS "courseId",
        count(qa.id)::int AS attempts,
        (count(qa.id) FILTER (WHERE qa.passed))::int AS passed,
        count(DISTINCT qa.user_id)::int AS students,
        COALESCE(round(avg(qa.score)), 0)::int AS "averageScore"
      FROM quizzes qz
      JOIN lessons l ON l.id = qz.lesson_id
      JOIN sections s ON s.id = l.section_id
      LEFT JOIN quiz_attempts qa ON qa.quiz_id = qz.id
      WHERE s.course_id IN (:courseIds)
      GROUP BY qz.id, qz.title, qz.pass_score, s.course_id
      ORDER BY qz.title
      `,
      { replacements: { courseIds }, type: QueryTypes.SELECT }
    );
  }

  // Weakest questions by share of wrong/skipped answers. Answers are only
  // counted when the attempt actually belonged to this question's quiz, so a
  // stray row can never pollute the ranking.
  public async getWeakestQuestions(courseIds: number[], limit: number): Promise<WeakQuestionRow[]> {
    if (courseIds.length === 0) return [];
    return Database.sequelize.query<WeakQuestionRow>(
      `
      SELECT
        qq.id AS "questionId",
        qq.question_text AS "questionText",
        qz.title AS "quizTitle",
        s.course_id AS "courseId",
        count(aa.id)::int AS answers,
        (count(aa.id) FILTER (WHERE o.id IS NULL OR NOT o.is_correct))::int AS wrong
      FROM quiz_questions qq
      JOIN quizzes qz ON qz.id = qq.quiz_id
      JOIN lessons l ON l.id = qz.lesson_id
      JOIN sections s ON s.id = l.section_id
      JOIN attempt_answers aa ON aa.question_id = qq.id
      JOIN quiz_attempts qa ON qa.id = aa.attempt_id AND qa.quiz_id = qq.quiz_id
      LEFT JOIN quiz_options o ON o.id = aa.option_id
      WHERE s.course_id IN (:courseIds)
      GROUP BY qq.id, qq.question_text, qz.title, s.course_id
      HAVING count(aa.id) > 0
      ORDER BY (count(aa.id) FILTER (WHERE o.id IS NULL OR NOT o.is_correct))::float / count(aa.id) DESC
      LIMIT :limit
      `,
      { replacements: { courseIds, limit }, type: QueryTypes.SELECT }
    );
  }

  public async getRecentEnrollments(courseIds: number[], limit: number): Promise<RecentEnrollmentRow[]> {
    if (courseIds.length === 0) return [];
    return Database.sequelize.query<RecentEnrollmentRow>(
      `
      SELECT
        e.id,
        e.course_id AS "courseId",
        e.enrolled_at AS "enrolledAt",
        u.name AS "userName",
        u.email,
        c.title AS "courseTitle"
      FROM enrollments e
      JOIN users u ON u.id = e.user_id
      JOIN courses c ON c.id = e.course_id
      WHERE e.course_id IN (:courseIds)
      ORDER BY e.enrolled_at DESC
      LIMIT :limit
      `,
      { replacements: { courseIds, limit }, type: QueryTypes.SELECT }
    );
  }

  // ---------- Admin ----------

  public async getPlatformTotals(): Promise<PlatformTotalsRow> {
    const rows = await Database.sequelize.query<PlatformTotalsRow>(
      `
      SELECT
        (SELECT count(*) FROM users)::int AS users,
        (SELECT count(*) FROM users WHERE role = :student)::int AS students,
        (SELECT count(*) FROM users WHERE role = :teacher)::int AS teachers,
        (SELECT count(*) FROM users WHERE role = :admin)::int AS admins,
        (SELECT count(*) FROM users WHERE is_banned)::int AS banned,
        (SELECT count(*) FROM enrollments)::int AS enrollments,
        (SELECT count(*) FROM reviews)::int AS reviews
      `,
      {
        replacements: { student: RoleEnum.student, teacher: RoleEnum.teacher, admin: RoleEnum.admin },
        type: QueryTypes.SELECT,
      }
    );
    return rows[0];
  }

  public async getOrderStats(): Promise<OrderStatRow[]> {
    return Database.sequelize.query<OrderStatRow>(
      `
      SELECT status, count(*)::int AS count, COALESCE(sum(amount), 0) AS amount
      FROM orders
      GROUP BY status
      `,
      { type: QueryTypes.SELECT }
    );
  }

  public async getGrowth(): Promise<GrowthRow> {
    const rows = await Database.sequelize.query<GrowthRow>(
      `
      SELECT
        (SELECT count(*) FROM users WHERE created_at > now() - interval '7 days')::int AS "signups7d",
        (SELECT count(*) FROM enrollments WHERE enrolled_at > now() - interval '7 days')::int AS "enrollments7d"
      `,
      { type: QueryTypes.SELECT }
    );
    return rows[0];
  }

  // Oldest submissions first: the queue order an admin actually works through.
  public async getReviewQueue(): Promise<ReviewQueueRow[]> {
    return Database.sequelize.query<ReviewQueueRow>(
      `
      SELECT
        c.id,
        c.title,
        c.slug,
        c.price,
        c.updated_at AS "updatedAt",
        u.name AS "teacherName",
        (SELECT count(*) FROM sections s WHERE s.course_id = c.id)::int AS sections,
        (SELECT count(*) FROM sections s JOIN lessons l ON l.section_id = s.id WHERE s.course_id = c.id)::int AS lessons
      FROM courses c
      JOIN users u ON u.id = c.teacher_id
      WHERE c.status = :pending
      ORDER BY c.updated_at ASC
      `,
      { replacements: { pending: CourseStatusEnum.pending }, type: QueryTypes.SELECT }
    );
  }

  public async getLatestOrders(limit: number): Promise<LatestOrderRow[]> {
    return Database.sequelize.query<LatestOrderRow>(
      `
      SELECT
        o.id,
        o.amount,
        o.status,
        o.created_at AS "createdAt",
        u.name AS "userName",
        u.email,
        c.title AS "courseTitle",
        c.slug AS "courseSlug"
      FROM orders o
      JOIN users u ON u.id = o.user_id
      JOIN courses c ON c.id = o.course_id
      ORDER BY o.created_at DESC
      LIMIT :limit
      `,
      { replacements: { limit }, type: QueryTypes.SELECT }
    );
  }

  public async getLatestUsers(limit: number): Promise<LatestUserRow[]> {
    return Database.sequelize.query<LatestUserRow>(
      `
      SELECT id, name, email, role, is_banned AS "isBanned", created_at AS "createdAt"
      FROM users
      ORDER BY created_at DESC
      LIMIT :limit
      `,
      { replacements: { limit }, type: QueryTypes.SELECT }
    );
  }

  // Published/pending courses with zero teachable content — the publish gate
  // should prevent these; presence means data was altered outside the API.
  public async getEmptyContentCourses(): Promise<EmptyCourseRow[]> {
    return Database.sequelize.query<EmptyCourseRow>(
      `
      SELECT c.id, c.title, c.status
      FROM courses c
      WHERE c.status IN (:statuses)
        AND NOT EXISTS (
          SELECT 1 FROM sections s
          JOIN lessons l ON l.section_id = s.id
          WHERE s.course_id = c.id
        )
      ORDER BY c.updated_at DESC
      `,
      { replacements: { statuses: [CourseStatusEnum.pending, CourseStatusEnum.published] }, type: QueryTypes.SELECT }
    );
  }

  // Invariant: a paid order always produced an enrollment in its transaction.
  // A non-zero count means something bypassed orderServices — surface it.
  public async countPaidOrdersWithoutEnrollment(): Promise<number> {
    const rows = await Database.sequelize.query<{ count: number }>(
      `
      SELECT count(*)::int AS count
      FROM orders o
      LEFT JOIN enrollments e ON e.order_id = o.id
      WHERE o.status = :paid AND e.id IS NULL
      `,
      { replacements: { paid: OrderStatusEnum.paid }, type: QueryTypes.SELECT }
    );
    return rows[0].count;
  }
}
