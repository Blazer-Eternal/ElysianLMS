import { RoleEnum } from "../enums/roleEnum";
import { CourseInterface, JwtPayload } from "../interfaces";
import { CourseStaffRepository } from "../repositories";
import Models from "../models";
import { AppError } from "../utils";

// The course's teacher or any admin
export const isCourseOwner = (user: JwtPayload, course: CourseInterface): boolean =>
  user.role === RoleEnum.admin || course.teacherId === user.userId;

// Owner, admin, or an assigned ta/co_teacher on this course.
// Used for everything that edits course *content* (sections, lessons, quizzes).
export const canManageCourse = async (user: JwtPayload, course: CourseInterface): Promise<boolean> => {
  if (isCourseOwner(user, course)) return true;
  const membership = await new CourseStaffRepository().findByCourseAndUser(course.id, user.userId);
  return Boolean(membership);
};

export const assertCanManageCourse = async (user: JwtPayload, course: CourseInterface): Promise<void> => {
  if (!(await canManageCourse(user, course))) {
    throw new AppError(403, "You do not have permission to manage this course");
  }
};

// Enrollment, ownership, or staff — the gate for consuming paid content
export const isCourseStudent = async (userId: number, courseId: number): Promise<boolean> =>
  Boolean(await Models.Enrollments.findOne({ where: { userId, courseId } }));

export const assertEnrolled = async (userId: number, courseId: number): Promise<void> => {
  if (!(await isCourseStudent(userId, courseId))) {
    throw new AppError(403, "You are not enrolled in this course");
  }
};
