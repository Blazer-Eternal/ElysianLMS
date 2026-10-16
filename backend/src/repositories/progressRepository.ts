import { InputProgressInterface, ProgressInterface } from "../interfaces";
import Models from "../models";

export class ProgressRepository {
  public async findCompletedLessonIds(userId: number, lessonIds: number[]): Promise<number[]> {
    if (lessonIds.length === 0) return [];
    const rows = await Models.Progress.findAll({
      where: { userId, lessonId: lessonIds },
      attributes: ["lessonId"],
    });
    return rows.map((row) => row.lessonId);
  }

  public async findByUserAndLesson(userId: number, lessonId: number): Promise<ProgressInterface | null> {
    return Models.Progress.findOne({ where: { userId, lessonId } });
  }

  public async countByUserAndCourseLessons(userId: number, lessonIds: number[]): Promise<number> {
    if (lessonIds.length === 0) return 0;
    return Models.Progress.count({ where: { userId, lessonId: lessonIds } });
  }

  public async create(data: InputProgressInterface): Promise<ProgressInterface> {
    return Models.Progress.create(data);
  }

  public async delete(userId: number, lessonId: number): Promise<boolean> {
    return (await Models.Progress.destroy({ where: { userId, lessonId } })) > 0;
  }
}
