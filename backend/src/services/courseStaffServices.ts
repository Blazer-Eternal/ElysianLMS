import { StaffRoleEnum } from "../enums/staffRoleEnum";
import { CourseStaffInterface, InputCourseStaffInterface, JwtPayload } from "../interfaces";
import { CourseStaffRepository, CourseRepository, UserRepository } from "../repositories";
import { AppError } from "../utils";
import { isCourseOwner } from "./accessControl";

export class CourseStaffServices {
  private courseStaffRepository = new CourseStaffRepository();
  private courseRepository = new CourseRepository();
  private userRepository = new UserRepository();

  public async getCourseStaff(user: JwtPayload, courseId: number): Promise<CourseStaffInterface[]> {
    const course = await this.courseRepository.findById(courseId);
    if (!course) throw new AppError(404, "Course not found");
    if (!isCourseOwner(user, course)) throw new AppError(403, "Only the course owner or an admin can view staff");

    return this.courseStaffRepository.findAllByCourse(courseId);
  }

  // Owner/Admin: give a user TA or co-teacher rights on the course.
  // Staff can manage content; ownership and payouts stay with the teacher.
  public async assignStaff(
    user: JwtPayload,
    courseId: number,
    data: { userId: number; staffRole?: StaffRoleEnum }
  ): Promise<CourseStaffInterface> {
    const course = await this.courseRepository.findById(courseId);
    if (!course) throw new AppError(404, "Course not found");
    if (!isCourseOwner(user, course)) throw new AppError(403, "Only the course owner or an admin can assign staff");

    if (course.teacherId === data.userId) {
      throw new AppError(400, "The course owner is already the manager of this course");
    }

    const assignee = await this.userRepository.findById(data.userId);
    if (!assignee) throw new AppError(404, "User not found");

    if (await this.courseStaffRepository.findByCourseAndUser(courseId, data.userId)) {
      throw new AppError(409, "This user is already staff on this course");
    }

    const membership: InputCourseStaffInterface = {
      courseId,
      userId: data.userId,
      staffRole: data.staffRole ?? StaffRoleEnum.ta,
    };
    return this.courseStaffRepository.create(membership);
  }

  // Replaces the role when the membership already exists
  public async updateStaffRole(user: JwtPayload, courseId: number, userId: number, staffRole: StaffRoleEnum): Promise<void> {
    const course = await this.courseRepository.findById(courseId);
    if (!course) throw new AppError(404, "Course not found");
    if (!isCourseOwner(user, course)) throw new AppError(403, "Only the course owner or an admin can change staff roles");

    const membership = await this.courseStaffRepository.findByCourseAndUser(courseId, userId);
    if (!membership) throw new AppError(404, "Staff membership not found");

    await this.courseStaffRepository.delete(membership.id);
    await this.courseStaffRepository.create({ courseId, userId, staffRole });
  }

  public async removeStaff(user: JwtPayload, courseId: number, userId: number): Promise<void> {
    const course = await this.courseRepository.findById(courseId);
    if (!course) throw new AppError(404, "Course not found");
    if (!isCourseOwner(user, course)) throw new AppError(403, "Only the course owner or an admin can remove staff");

    const membership = await this.courseStaffRepository.findByCourseAndUser(courseId, userId);
    if (!membership) throw new AppError(404, "Staff membership not found");

    await this.courseStaffRepository.delete(membership.id);
  }
}
