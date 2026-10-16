import { Transaction } from "sequelize";
import { EnrollmentInterface, InputEnrollmentInterface } from "../interfaces";
import Models from "../models";

export class EnrollmentRepository {
  public async findAllByUser(userId: number): Promise<EnrollmentInterface[]> {
    return Models.Enrollments.findAll({
      where: { userId },
      include: [{ model: Models.Courses, as: "course", attributes: ["id", "title", "slug", "thumbnailUrl", "price", "status"] }],
      order: [["enrolledAt", "DESC"]],
    });
  }

  public async findAllByCourse(courseId: number): Promise<EnrollmentInterface[]> {
    return Models.Enrollments.findAll({
      where: { courseId },
      include: [{ model: Models.Users, as: "user", attributes: ["id", "name", "email", "avatarUrl"] }],
      order: [["enrolledAt", "DESC"]],
    });
  }

  public async findByUserAndCourse(userId: number, courseId: number): Promise<EnrollmentInterface | null> {
    return Models.Enrollments.findOne({ where: { userId, courseId } });
  }

  public async countByCourse(courseId: number): Promise<number> {
    return Models.Enrollments.count({ where: { courseId } });
  }

  public async findById(id: number): Promise<EnrollmentInterface | null> {
    return Models.Enrollments.findByPk(id);
  }

  public async create(data: InputEnrollmentInterface, transaction?: Transaction): Promise<EnrollmentInterface> {
    return Models.Enrollments.create(data, { transaction });
  }

  public async delete(id: number, transaction?: Transaction): Promise<boolean> {
    return (await Models.Enrollments.destroy({ where: { id }, transaction })) > 0;
  }
}
