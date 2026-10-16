import { CourseStatusEnum } from "../enums/courseStatusEnum";
import { RoleEnum } from "../enums/roleEnum";
import { CourseInterface, InputCourseInterface, JwtPayload } from "../interfaces";
import { CourseRepository, LessonRepository, SectionRepository } from "../repositories";
import { AppError, slugify } from "../utils";
import { assertCanManageCourse, canManageCourse } from "./accessControl";

export class CourseServices {
  private courseRepository = new CourseRepository();
  private sectionRepository = new SectionRepository();
  private lessonRepository = new LessonRepository();

  private async getOrFail(id: number): Promise<CourseInterface> {
    const course = await this.courseRepository.findById(id);
    if (!course) throw new AppError(404, "Course not found");
    return course;
  }

  public async getPublishedCourses(query: { categoryId?: number; page: number; limit: number }) {
    const { rows, count } = await this.courseRepository.findPublished({
      categoryId: query.categoryId,
      limit: query.limit,
      offset: (query.page - 1) * query.limit,
    });

    return {
      courses: rows,
      pagination: {
        page: query.page,
        limit: query.limit,
        total: count,
        totalPages: Math.ceil(count / query.limit),
      },
    };
  }

  public async getPublishedCourse(id: number) {
    const course = await this.courseRepository.findPublishedById(id);
    if (!course) throw new AppError(404, "Course not found");
    return course;
  }

  // Teacher/Admin: their own courses, any status
  public async getTeacherCourses(teacherId: number) {
    return this.courseRepository.findByTeacher(teacherId);
  }

  // Teacher/Admin/Staff: a course they manage, regardless of status.
  // Lets staff open a draft course's curriculum without publishing it.
  public async getManagedCourse(user: JwtPayload, id: number) {
    const course = await this.getOrFail(id);
    await assertCanManageCourse(user, course);
    return course;
  }

  // new courses always start as draft
  public async createCourse(
    teacherId: number,
    data: Omit<InputCourseInterface, "teacherId" | "slug" | "status"> & { slug?: string }
  ) {
    const slug = data.slug ?? slugify(data.title, 220);
    if (!slug) throw new AppError(400, "Could not generate a slug, please provide one");

    return this.courseRepository.create({ ...data, teacherId, slug });
  }

  // Owner/Admin: update details. teacherId and status are deliberately
  // un-settable here — ownership changes and status have their own paths.
  public async updateCourse(
    user: JwtPayload,
    id: number,
    data: Partial<Omit<InputCourseInterface, "teacherId" | "status">>
  ) {
    const course = await this.getOrFail(id);
    await assertCanManageCourse(user, course);

    return this.courseRepository.update(id, data);
  }

  //  - teacher/staff: submit for review (draft/rejected -> pending) or archive
  //  - admin: any status
  // Submitting also gates on content: an empty course cannot go to review.
  public async updateStatus(user: JwtPayload, id: number, status: CourseStatusEnum) {
    const course = await this.getOrFail(id);

    if (user.role !== RoleEnum.admin) {
      await assertCanManageCourse(user, course);

      if (status !== CourseStatusEnum.pending && status !== CourseStatusEnum.archived) {
        throw new AppError(403, `Only an admin can set status '${status}'`);
      }
      if (
        status === CourseStatusEnum.pending &&
        course.status !== CourseStatusEnum.draft &&
        course.status !== CourseStatusEnum.rejected
      ) {
        throw new AppError(400, "Only draft or rejected courses can be submitted for review");
      }
    }

    if (status === CourseStatusEnum.pending) {
      await this.assertHasContent(id);
    }

    await this.courseRepository.update(id, { status });
    return { id: course.id, status };
  }

  // A course needs at least one section with one lesson before review —
  // otherwise admins would review empty shells.
  private async assertHasContent(courseId: number): Promise<void> {
    const sections = await this.sectionRepository.findAllByCourse(courseId);
    if (sections.length === 0) {
      throw new AppError(400, "Add at least one section before submitting for review");
    }

    for (const section of sections) {
      if ((await this.lessonRepository.findAllBySection(section.id)).length > 0) return;
    }

    throw new AppError(400, "Add at least one lesson before submitting for review");
  }

  // Owner/Admin: delete. Enrollments/orders RESTRICT at the DB level, so a
  // course with paying students cannot be deleted — the FK error maps to 409.
  public async deleteCourse(user: JwtPayload, id: number): Promise<void> {
    const course = await this.getOrFail(id);

    // staff may not delete the course itself, only edit its content
    if (user.role !== RoleEnum.admin && course.teacherId !== user.userId) {
      throw new AppError(403, "Only the course owner or an admin can delete this course");
    }

    await this.courseRepository.delete(id);
  }
}
