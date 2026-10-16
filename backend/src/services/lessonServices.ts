import { Database } from "../config";
import { LessonInterface, InputLessonInterface, JwtPayload } from "../interfaces";
import { CourseRepository, LessonRepository, QuizRepository, SectionRepository } from "../repositories";
import { AppError, plain } from "../utils";
import { assertCanManageCourse, assertEnrolled, canManageCourse, isCourseStudent } from "./accessControl";

export class LessonServices {
  private lessonRepository = new LessonRepository();
  private sectionRepository = new SectionRepository();
  private courseRepository = new CourseRepository();
  private quizRepository = new QuizRepository();

  private async resolveCourse(lessonId: number) {
    const lesson = await this.lessonRepository.findById(lessonId);
    if (!lesson) throw new AppError(404, "Lesson not found");

    const section = await this.sectionRepository.findById(lesson.sectionId);
    if (!section) throw new AppError(404, "Section not found");

    const course = await this.courseRepository.findById(section.courseId);
    if (!course) throw new AppError(404, "Course not found");

    return { lesson, section, course };
  }

  // Owner/Admin/Staff: lessons of a section
  public async getLessons(user: JwtPayload, sectionId: number): Promise<LessonInterface[]> {
    const section = await this.sectionRepository.findById(sectionId);
    if (!section) throw new AppError(404, "Section not found");

    const course = await this.courseRepository.findById(section.courseId);
    if (!course) throw new AppError(404, "Course not found");
    await assertCanManageCourse(user, course);

    return this.lessonRepository.findAllBySection(sectionId);
  }

  public async createLesson(
    user: JwtPayload,
    sectionId: number,
    data: Omit<InputLessonInterface, "sectionId" | "orderIndex"> & { orderIndex?: number }
  ): Promise<LessonInterface> {
    const section = await this.sectionRepository.findById(sectionId);
    if (!section) throw new AppError(404, "Section not found");

    const course = await this.courseRepository.findById(section.courseId);
    if (!course) throw new AppError(404, "Course not found");
    await assertCanManageCourse(user, course);

    const orderIndex = data.orderIndex ?? (await this.lessonRepository.findNextIndex(sectionId));
    return this.lessonRepository.create({ ...data, sectionId, orderIndex });
  }

  public async updateLesson(
    user: JwtPayload,
    id: number,
    data: Partial<Omit<InputLessonInterface, "sectionId">>
  ): Promise<void> {
    const { course, lesson } = await this.resolveCourse(id);
    await assertCanManageCourse(user, course);

    // changing sectionId is a move, not an update — use moveLesson for that
    await this.lessonRepository.update(lesson.id, data);
  }

  // Move a lesson to another section of the SAME course, at an optional position
  public async moveLesson(user: JwtPayload, id: number, targetSectionId: number, targetIndex?: number): Promise<void> {
    const { course, lesson } = await this.resolveCourse(id);
    await assertCanManageCourse(user, course);

    const targetSection = await this.sectionRepository.findById(targetSectionId);
    if (!targetSection) throw new AppError(404, "Target section not found");
    if (targetSection.courseId !== course.id) {
      throw new AppError(400, "Cannot move a lesson to a section of another course");
    }

    const targetLessons = (await this.lessonRepository.findAllBySection(targetSectionId)).map((l) => plain(l));
    const withoutMoved = targetLessons.filter((l) => l.id !== id);
    const position = targetIndex === undefined ? withoutMoved.length : Math.max(0, Math.min(targetIndex, withoutMoved.length));

    await Database.sequelize.transaction(async (t) => {
      if (lesson.sectionId === targetSectionId) {
        withoutMoved.splice(withoutMoved.findIndex((l) => l.id === id), 0, plain(lesson));
        for (const [idx, l] of withoutMoved.entries()) {
          if (l.orderIndex !== idx) await this.lessonRepository.update(l.id, { orderIndex: idx }, t);
        }
      } else {
        await this.lessonRepository.update(id, { sectionId: targetSectionId }, t);
        withoutMoved.splice(position, 0, { ...plain(lesson), sectionId: targetSectionId });
        for (const [idx, l] of withoutMoved.entries()) {
          await this.lessonRepository.update(l.id, { orderIndex: idx }, t);
        }
        // close the gap in the old section
        const oldSectionLessons = await this.lessonRepository.findAllBySection(lesson.sectionId);
        for (const [idx, l] of oldSectionLessons.entries()) {
          if (l.orderIndex !== idx) await this.lessonRepository.update(l.id, { orderIndex: idx }, t);
        }
      }
    });
  }

  public async reorderLesson(user: JwtPayload, id: number, targetIndex: number): Promise<void> {
    const { course, lesson } = await this.resolveCourse(id);
    await assertCanManageCourse(user, course);

    if (!Number.isInteger(targetIndex) || targetIndex < 0) {
      throw new AppError(400, "Invalid target index");
    }

    const lessons = (await this.lessonRepository.findAllBySection(lesson.sectionId)).map((l) => plain(l));
    const withoutMoved = lessons.filter((l) => l.id !== id);
    withoutMoved.splice(Math.min(targetIndex, withoutMoved.length), 0, plain(lesson));

    await Database.sequelize.transaction(async (t) => {
      for (const [position, l] of withoutMoved.entries()) {
        if (l.orderIndex !== position) await this.lessonRepository.update(l.id, { orderIndex: position }, t);
      }
    });
  }

  public async deleteLesson(user: JwtPayload, id: number): Promise<void> {
    const { course, lesson } = await this.resolveCourse(id);
    await assertCanManageCourse(user, course);
    await this.lessonRepository.delete(lesson.id);
  }

  // Anyone (public for previews): full lesson for enrolled students,
  // preview-flagged lessons for everyone else. Never leaks video/content otherwise.
  public async getLessonForViewing(user: JwtPayload | null, id: number) {
    const { lesson, course } = await this.resolveCourse(id);

    const privileged =
      user !== null && ((await canManageCourse(user, course)) || (await isCourseStudent(user.userId, course.id)));

    if (!privileged && !lesson.isPreview) {
      // be honest about existence only to people who may know it exists
      if (user) await assertEnrolled(user.userId, course.id);
      throw new AppError(403, "Enroll in this course to view the lesson");
    }

    const quiz = await this.quizRepository.findByLessonId(lesson.id);

    return {
      lesson,
      course: { id: course.id, title: course.title, slug: course.slug },
      quiz: quiz ? { id: quiz.id, title: quiz.title, passScore: quiz.passScore } : null,
    };
  }
}
