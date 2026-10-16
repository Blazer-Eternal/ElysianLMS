import { CourseStatusEnum } from "../enums/courseStatusEnum";
import { CourseInterface, InputCourseInterface } from "../interfaces";
import Models from "../models";

const courseInclude = [
  { model: Models.Categories, as: "category", attributes: ["id", "name", "slug"] },
  { model: Models.Users, as: "teacher", attributes: ["id", "name", "avatarUrl"] },
];

export class CourseRepository {
  public async findPublished(options: { categoryId?: number; limit: number; offset: number }) {
    const where: { status: CourseStatusEnum; categoryId?: number } = {
      status: CourseStatusEnum.published,
    };
    if (options.categoryId) where.categoryId = options.categoryId;

    return Models.Courses.findAndCountAll({
      where,
      include: courseInclude,
      order: [["createdAt", "DESC"]],
      limit: options.limit,
      offset: options.offset,
    });
  }

  public async findPublishedById(id: number) {
    return Models.Courses.findOne({
      where: { id, status: CourseStatusEnum.published },
      include: courseInclude,
    });
  }

  public async findById(id: number): Promise<CourseInterface | null> {
    return Models.Courses.findByPk(id);
  }

  public async findByTeacher(teacherId: number) {
    return Models.Courses.findAll({
      where: { teacherId },
      include: courseInclude,
      order: [["createdAt", "DESC"]],
    });
  }

  public async create(data: InputCourseInterface): Promise<CourseInterface> {
    return Models.Courses.create(data);
  }

  public async update(id: number, data: Partial<InputCourseInterface>) {
    await Models.Courses.update(data, { where: { id } });
    return Models.Courses.findOne({ where: { id }, include: courseInclude });
  }

  public async delete(id: number): Promise<boolean> {
    return (await Models.Courses.destroy({ where: { id } })) > 0;
  }
}