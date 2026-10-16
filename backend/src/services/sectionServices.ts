import { Database } from "../config";
import { CourseInterface, InputSectionInterface, JwtPayload, SectionInterface } from "../interfaces";
import { CourseRepository, LessonRepository, SectionRepository } from "../repositories";
import { AppError, plain } from "../utils";
import { assertCanManageCourse } from "./accessControl";

export class SectionServices {
  private sectionRepository = new SectionRepository();
  private courseRepository = new CourseRepository();
  private lessonRepository = new LessonRepository();

  // Owner/Admin/Staff: sections of a course, each with its lessons
  public async getSections(user: JwtPayload, courseId: number) {
    const course = await this.courseRepository.findById(courseId);
    if (!course) throw new AppError(404, "Course not found");
    await assertCanManageCourse(user, course);

    const sections = await this.sectionRepository.findAllByCourse(courseId);
    return Promise.all(
      sections.map(async (section) => ({
        // plain() first: spreading a Sequelize instance directly leaks
        // dataValues/_changed internals into the response
        ...plain(section),
        lessons: (await this.lessonRepository.findAllBySection(section.id)).map((l) => plain(l)),
      }))
    );
  }

  // orderIndex omitted -> appended to the end
  public async createSection(user: JwtPayload, courseId: number, data: Omit<InputSectionInterface, "courseId" | "orderIndex"> & { orderIndex?: number }) {
    const course = await this.courseRepository.findById(courseId);
    if (!course) throw new AppError(404, "Course not found");
    await assertCanManageCourse(user, course);

    const orderIndex = data.orderIndex ?? (await this.sectionRepository.findNextIndex(courseId));
    return this.sectionRepository.create({ courseId, title: data.title, orderIndex });
  }

  public async updateSection(user: JwtPayload, id: number, data: Partial<Pick<InputSectionInterface, "title" | "orderIndex">>): Promise<void> {
    const section = await this.sectionRepository.findById(id);
    if (!section) throw new AppError(404, "Section not found");

    const course = await this.courseRepository.findById(section.courseId);
    if (!course) throw new AppError(404, "Course not found");
    await assertCanManageCourse(user, course);

    await this.sectionRepository.update(id, data);
  }

  // Whole-section move: target position is closed over by shifting the others.
  // Runs in one transaction so the deferrable unique (course_id, order_index)
  // is only checked at commit — no transient collisions.
  public async reorderSection(user: JwtPayload, id: number, targetIndex: number): Promise<void> {
    const section = await this.sectionRepository.findById(id);
    if (!section) throw new AppError(404, "Section not found");

    const course = await this.courseRepository.findById(section.courseId);
    if (!course) throw new AppError(404, "Course not found");
    await assertCanManageCourse(user, course);

    if (targetIndex < 0 || !Number.isInteger(targetIndex)) {
      throw new AppError(400, "Invalid target index");
    }

    const sections = (await this.sectionRepository.findAllByCourse(section.courseId)).map((s) => plain(s));
    const boundedTarget = Math.min(targetIndex, sections.length - 1);
    const withoutMoved = sections.filter((s) => s.id !== id);
    withoutMoved.splice(boundedTarget, 0, plain(section));

    await Database.sequelize.transaction(async (t) => {
      for (const [position, s] of withoutMoved.entries()) {
        if (s.orderIndex !== position) {
          await this.sectionRepository.update(s.id, { orderIndex: position }, t);
        }
      }
    });
  }

  public async deleteSection(user: JwtPayload, id: number): Promise<void> {
    const section = await this.sectionRepository.findById(id);
    if (!section) throw new AppError(404, "Section not found");

    const course = await this.courseRepository.findById(section.courseId);
    if (!course) throw new AppError(404, "Course not found");
    await assertCanManageCourse(user, course);

    // leaves a gap in order_index; next create fills it via findNextIndex.
    // Safe because the constraint only forbids duplicates, not gaps.
    await this.sectionRepository.delete(id);
  }
}
