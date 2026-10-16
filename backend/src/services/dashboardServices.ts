import { CourseStatusEnum } from "../enums/courseStatusEnum";
import { OrderStatusEnum } from "../enums/orderStatusEnum";
import { JwtPayload } from "../interfaces";
import { DashboardRepository, ProgressRepository, StudentCourseRow } from "../repositories";

// Three dashboards, each scoped by identity rather than by coarse role:
//   - student: rows keyed to user_id only
//   - teacher: courses owned OR staffed (so a TA with role=student sees theirs)
//   - admin:   platform-wide, gated at the route with grantRole(admin)
// Query-count discipline: grouped/aggregate SQL, no per-row fan-out.

const RECENT_ATTEMPTS = 8;
const UNREVIEWED_LIMIT = 6;
const WEAKEST_QUESTION_LIMIT = 10;
const RECENT_ENROLLMENTS = 10;
const QUEUE_LIMIT = 10;
// "Continue learning" only probes the most recent enrollments — enough to
// find a resume point without walking the student's whole history.
const RESUME_PROBE_LIMIT = 5;

const toNumber = (value: string | number | null | undefined): number =>
  value === null || value === undefined ? 0 : Number(value);

const round1 = (value: number): number => Math.round(value * 10) / 10;

export class DashboardServices {
  private dashboardRepository = new DashboardRepository();
  private progressRepository = new ProgressRepository();

  // ---------- Student ----------

  public async getStudentDashboard(user: JwtPayload) {
    const courses = await this.dashboardRepository.getStudentCourses(user.userId);

    const summary = {
      enrolled: courses.length,
      completed: courses.filter((c) => c.totalLessons > 0 && c.completedLessons >= c.totalLessons).length,
      inProgress: courses.filter((c) => c.completedLessons > 0 && c.completedLessons < c.totalLessons).length,
      averageProgress:
        courses.length === 0
          ? 0
          : Math.round(
              courses.reduce(
                (sum, c) =>
                  sum + (c.totalLessons === 0 ? 0 : (c.completedLessons / c.totalLessons) * 100),
                0
              ) / courses.length
            ),
    };

    const [continueLearning, pendingOrder, recentAttempts, quizSummary, unreviewedCourses] =
      await Promise.all([
        this.findResumePoint(user.userId, courses),
        this.dashboardRepository.getLatestPendingOrder(user.userId),
        this.dashboardRepository.getRecentAttempts(user.userId, RECENT_ATTEMPTS),
        this.dashboardRepository.getQuizSummary(user.userId),
        this.dashboardRepository.getUnreviewedCourses(user.userId, UNREVIEWED_LIMIT),
      ]);

    return {
      summary,
      courses: courses.map((c) => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        thumbnailUrl: c.thumbnailUrl,
        price: toNumber(c.price),
        status: c.status,
        enrolledAt: c.enrolledAt,
        totalLessons: c.totalLessons,
        completedLessons: c.completedLessons,
        percent: c.totalLessons === 0 ? 0 : Math.round((c.completedLessons / c.totalLessons) * 100),
      })),
      continueLearning,
      pendingOrder: pendingOrder
        ? {
            id: pendingOrder.id,
            amount: toNumber(pendingOrder.amount),
            status: pendingOrder.status,
            createdAt: pendingOrder.createdAt,
            course: {
              id: pendingOrder.courseId,
              title: pendingOrder.courseTitle,
              slug: pendingOrder.courseSlug,
            },
          }
        : null,
      quizSummary: {
        totalAttempts: quizSummary.total,
        passedAttempts: quizSummary.passed,
        averageScore: quizSummary.averageScore,
      },
      recentAttempts: recentAttempts.map((a) => ({
        id: a.id,
        score: a.score,
        passed: a.passed,
        submittedAt: a.submittedAt,
        quizId: a.quizId,
        quizTitle: a.quizTitle,
        courseId: a.courseId,
        courseTitle: a.courseTitle,
      })),
      unreviewedCourses: unreviewedCourses.map((c) => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        thumbnailUrl: c.thumbnailUrl,
      })),
    };
  }

  // First incomplete lesson of the most recently enrolled course that still
  // has one; null when everything the student touches is finished.
  private async findResumePoint(userId: number, courses: StudentCourseRow[]) {
    const candidates = courses.slice(0, RESUME_PROBE_LIMIT);
    if (candidates.length === 0) return null;

    const outline = await this.dashboardRepository.getCourseOutline(candidates.map((c) => c.id));
    if (outline.length === 0) return null;

    const completed = new Set(await this.progressRepository.findCompletedLessonIds(
      userId,
      outline.map((r) => r.lessonId)
    ));

    // candidates are already in enrolled_at DESC order
    for (const course of candidates) {
      const next = outline.find((r) => r.courseId === course.id && !completed.has(r.lessonId));
      if (next) {
        return {
          courseId: next.courseId,
          courseTitle: course.title,
          sectionId: next.sectionId,
          sectionTitle: next.sectionTitle,
          lessonId: next.lessonId,
          lessonTitle: next.lessonTitle,
        };
      }
    }
    return null;
  }

  // ---------- Teacher / TA ----------

  public async getTeacherDashboard(user: JwtPayload) {
    const courseIds = await this.dashboardRepository.getManagedCourseIds(user.userId);

    const empty = {
      summary: {
        totalCourses: 0,
        published: 0,
        pending: 0,
        draft: 0,
        rejected: 0,
        archived: 0,
        totalStudents: 0,
        totalEnrollments: 0,
        totalLessons: 0,
      },
      courses: [] as unknown[],
      quizAnalytics: { quizzes: [] as unknown[], weakestQuestions: [] as unknown[] },
      recentEnrollments: [] as unknown[],
    };
    if (courseIds.length === 0) return empty;

    const [courses, statusCounts, totals, quizStats, weakestQuestions, recentEnrollments] =
      await Promise.all([
        this.dashboardRepository.getManagedCourses(courseIds),
        this.dashboardRepository.getCourseStatusCounts(courseIds),
        this.dashboardRepository.getEnrollmentTotals(courseIds),
        this.dashboardRepository.getQuizStats(courseIds),
        this.dashboardRepository.getWeakestQuestions(courseIds, WEAKEST_QUESTION_LIMIT),
        this.dashboardRepository.getRecentEnrollments(courseIds, RECENT_ENROLLMENTS),
      ]);

    // zero-fill every status so the UI never has to guess missing keys
    const byStatus: Record<string, number> = {
      [CourseStatusEnum.draft]: 0,
      [CourseStatusEnum.pending]: 0,
      [CourseStatusEnum.published]: 0,
      [CourseStatusEnum.rejected]: 0,
      [CourseStatusEnum.archived]: 0,
    };
    for (const row of statusCounts) byStatus[row.status] = row.count;

    return {
      summary: {
        totalCourses: courses.length,
        published: byStatus[CourseStatusEnum.published],
        pending: byStatus[CourseStatusEnum.pending],
        draft: byStatus[CourseStatusEnum.draft],
        rejected: byStatus[CourseStatusEnum.rejected],
        archived: byStatus[CourseStatusEnum.archived],
        totalStudents: totals.students,
        totalEnrollments: totals.enrollments,
        totalLessons: courses.reduce((sum, c) => sum + c.lessons, 0),
      },
      courses: courses.map((c) => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        status: c.status,
        price: toNumber(c.price),
        thumbnailUrl: c.thumbnailUrl,
        teacherId: c.teacherId,
        teacherName: c.teacherName,
        isOwner: c.teacherId === user.userId,
        updatedAt: c.updatedAt,
        sections: c.sections,
        lessons: c.lessons,
        enrollments: c.enrollments,
        reviewCount: c.reviewCount,
        reviewAverage: round1(toNumber(c.reviewAverage)),
        // mirrors the publish gate: can this course be submitted right now?
        publishReady: c.lessons > 0,
      })),
      quizAnalytics: {
        quizzes: quizStats.map((q) => ({
          quizId: q.quizId,
          title: q.title,
          passScore: q.passScore,
          courseId: q.courseId,
          attempts: q.attempts,
          passed: q.passed,
          students: q.students,
          averageScore: q.averageScore,
          passRate: q.attempts === 0 ? 0 : Math.round((q.passed / q.attempts) * 100),
        })),
        weakestQuestions: weakestQuestions.map((w) => ({
          questionId: w.questionId,
          questionText: w.questionText,
          quizTitle: w.quizTitle,
          courseId: w.courseId,
          answers: w.answers,
          wrong: w.wrong,
          wrongRate: Math.round((w.wrong / w.answers) * 100),
        })),
      },
      recentEnrollments: recentEnrollments.map((e) => ({
        id: e.id,
        courseId: e.courseId,
        courseTitle: e.courseTitle,
        userName: e.userName,
        email: e.email,
        enrolledAt: e.enrolledAt,
      })),
    };
  }

  // ---------- Admin ----------

  // Route-gated to admins; no per-row scoping needed, but revenue only counts
  // money actually captured (paid), never pending/failed/refunded.
  public async getAdminDashboard() {
    const [totals, statusCounts, orderStats, growth, reviewQueue, latestOrders, latestUsers, emptyCourses, orphanPaid] =
      await Promise.all([
        this.dashboardRepository.getPlatformTotals(),
        this.dashboardRepository.getCourseStatusCounts(),
        this.dashboardRepository.getOrderStats(),
        this.dashboardRepository.getGrowth(),
        this.dashboardRepository.getReviewQueue(),
        this.dashboardRepository.getLatestOrders(QUEUE_LIMIT),
        this.dashboardRepository.getLatestUsers(QUEUE_LIMIT),
        this.dashboardRepository.getEmptyContentCourses(),
        this.dashboardRepository.countPaidOrdersWithoutEnrollment(),
      ]);

    const coursesByStatus: Record<string, number> = {
      [CourseStatusEnum.draft]: 0,
      [CourseStatusEnum.pending]: 0,
      [CourseStatusEnum.published]: 0,
      [CourseStatusEnum.rejected]: 0,
      [CourseStatusEnum.archived]: 0,
    };
    for (const row of statusCounts) coursesByStatus[row.status] = row.count;

    const ordersByStatus: Record<string, { count: number; amount: number }> = {};
    for (const status of Object.values(OrderStatusEnum)) ordersByStatus[status] = { count: 0, amount: 0 };
    for (const row of orderStats) {
      ordersByStatus[row.status] = { count: row.count, amount: toNumber(row.amount) };
    }

    const refunded = ordersByStatus[OrderStatusEnum.refunded];
    const paid = ordersByStatus[OrderStatusEnum.paid];

    return {
      totals: {
        users: totals.users,
        students: totals.students,
        teachers: totals.teachers,
        admins: totals.admins,
        bannedUsers: totals.banned,
        enrollments: totals.enrollments,
        reviews: totals.reviews,
        courses: Object.values(coursesByStatus).reduce((sum, n) => sum + n, 0),
        coursesByStatus,
      },
      revenue: {
        // captured money; refunds are tracked separately so net stays honest
        paid: paid.amount,
        refunded: refunded.amount,
        net: round1(paid.amount - refunded.amount),
        pending: ordersByStatus[OrderStatusEnum.pending].amount,
      },
      ordersByStatus,
      growth,
      reviewQueue: reviewQueue.map((c) => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        price: toNumber(c.price),
        teacherName: c.teacherName,
        sections: c.sections,
        lessons: c.lessons,
        updatedAt: c.updatedAt,
        // same gate the submit endpoint enforces — flag only, never blocks here
        publishReady: c.lessons > 0,
      })),
      latestOrders: latestOrders.map((o) => ({
        id: o.id,
        amount: toNumber(o.amount),
        status: o.status,
        createdAt: o.createdAt,
        userName: o.userName,
        email: o.email,
        courseTitle: o.courseTitle,
        courseSlug: o.courseSlug,
      })),
      latestUsers: latestUsers.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        isBanned: u.isBanned,
        createdAt: u.createdAt,
      })),
      riskFlags: {
        emptyContentCourses: emptyCourses.map((c) => ({ id: c.id, title: c.title, status: c.status })),
        paidOrdersWithoutEnrollment: orphanPaid,
      },
    };
  }
}
