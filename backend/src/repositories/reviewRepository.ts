import { Database } from "../config";
import { InputReviewInterface, ReviewInterface } from "../interfaces";
import Models from "../models";

export class ReviewRepository {
  public async findAllByCourse(courseId: number): Promise<ReviewInterface[]> {
    return Models.Reviews.findAll({
      where: { courseId },
      include: [{ model: Models.Users, as: "user", attributes: ["id", "name", "avatarUrl"] }],
      order: [["createdAt", "DESC"]],
    });
  }

  public async findByUserAndCourse(userId: number, courseId: number): Promise<ReviewInterface | null> {
    return Models.Reviews.findOne({ where: { userId, courseId } });
  }

  public async findById(id: number): Promise<ReviewInterface | null> {
    return Models.Reviews.findByPk(id);
  }

  public async getCourseSummary(courseId: number): Promise<{ average: number; count: number }> {
    const row = await Models.Reviews.findOne({
      where: { courseId },
      attributes: [
        [Database.sequelize.fn("AVG", Database.sequelize.col("rating")), "average"],
        [Database.sequelize.fn("COUNT", Database.sequelize.col("id")), "count"],
      ],
      raw: true,
    });

    const average = row ? Number((row as unknown as { average: string | null }).average ?? 0) : 0;
    const count = row ? Number((row as unknown as { count: string }).count) : 0;
    return { average: Math.round(average * 10) / 10, count };
  }

  public async create(data: InputReviewInterface): Promise<ReviewInterface> {
    return Models.Reviews.create(data);
  }

  public async update(id: number, data: Partial<InputReviewInterface>): Promise<void> {
    await Models.Reviews.update(data, { where: { id } });
  }

  public async delete(id: number): Promise<boolean> {
    return (await Models.Reviews.destroy({ where: { id } })) > 0;
  }
}
