import { CourseStatusEnum } from "../enums/courseStatusEnum";
import { EnrollmentInterface, JwtPayload } from "../interfaces";
import { CourseRepository, EnrollmentRepository, OrderRepository } from "../repositories";
import { AppError } from "../utils";
import { assertCanManageCourse } from "./accessControl";

export class EnrollmentServices {
  private enrollmentRepository = new EnrollmentRepository();
  private courseRepository = new CourseRepository();
  private orderRepository = new OrderRepository();

  public async getMyEnrollments(user: JwtPayload): Promise<EnrollmentInterface[]> {
    return this.enrollmentRepository.findAllByUser(user.userId);
  }

  // Owner/Admin/Staff: who is in the course
  public async getCourseEnrollments(user: JwtPayload, courseId: number): Promise<EnrollmentInterface[]> {
    const course = await this.courseRepository.findById(courseId);
    if (!course) throw new AppError(404, "Course not found");
    await assertCanManageCourse(user, course);

    return this.enrollmentRepository.findAllByCourse(courseId);
  }

  // Free-course self-enrollment (order_id NULL = free, by design).
  // Paid courses must go through the order flow — no exceptions.
  public async enrollInFreeCourse(user: JwtPayload, courseId: number): Promise<EnrollmentInterface> {
    const course = await this.courseRepository.findById(courseId);
    if (!course) throw new AppError(404, "Course not found");
    if (course.status !== CourseStatusEnum.published) {
      throw new AppError(400, "This course is not open for enrollment");
    }
    if (course.price > 0) {
      throw new AppError(400, "This course is paid — purchase it through the order flow");
    }
    if (await this.enrollmentRepository.findByUserAndCourse(user.userId, courseId)) {
      throw new AppError(409, "You are already enrolled in this course");
    }

    return this.enrollmentRepository.create({ userId: user.userId, courseId, orderId: null });
  }

  // Admin: grant access without payment (scholarships, comp copies, support fixes)
  public async grantEnrollment(courseId: number, userId: number): Promise<EnrollmentInterface> {
    const course = await this.courseRepository.findById(courseId);
    if (!course) throw new AppError(404, "Course not found");
    if (await this.enrollmentRepository.findByUserAndCourse(userId, courseId)) {
      throw new AppError(409, "This user is already enrolled in this course");
    }

    return this.enrollmentRepository.create({ userId, courseId, orderId: null });
  }

  // Admin: revoke access. An enrollment tied to a paid order is refused —
  // revoke the order instead so payment and access stay consistent.
  public async revokeEnrollment(id: number): Promise<void> {
    const enrollment = await this.enrollmentRepository.findById(id);
    if (!enrollment) throw new AppError(404, "Enrollment not found");

    if (enrollment.orderId) {
      const order = await this.orderRepository.findById(enrollment.orderId);
      throw new AppError(
        409,
        `This enrollment came from order #${enrollment.orderId} (status '${order?.status}') — refund the order instead`
      );
    }

    await this.enrollmentRepository.delete(id);
  }
}
