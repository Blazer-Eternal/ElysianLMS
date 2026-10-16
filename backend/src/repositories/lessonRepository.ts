import { Transaction } from "sequelize";
import { InputLessonInterface, LessonInterface } from "../interfaces";
import Models from "../models";

export class LessonRepository {
  public async findAllBySection(sectionId: number): Promise<LessonInterface[]> {
    return Models.Lessons.findAll({
      where: { sectionId },
      order: [["orderIndex", "ASC"]],
    });
  }

  public async findById(id: number): Promise<LessonInterface | null> {
    return Models.Lessons.findByPk(id);
  }

  public async findNextIndex(sectionId: number): Promise<number> {
    const last = await Models.Lessons.findOne({
      where: { sectionId },
      order: [["orderIndex", "DESC"]],
      attributes: ["orderIndex"],
    });
    return last ? last.orderIndex + 1 : 0;
  }

  public async create(data: InputLessonInterface): Promise<LessonInterface> {
    return Models.Lessons.create(data);
  }

  public async update(id: number, data: Partial<InputLessonInterface>, transaction?: Transaction): Promise<void> {
    await Models.Lessons.update(data, { where: { id }, transaction });
  }

  public async delete(id: number): Promise<boolean> {
    return (await Models.Lessons.destroy({ where: { id } })) > 0;
  }
}
