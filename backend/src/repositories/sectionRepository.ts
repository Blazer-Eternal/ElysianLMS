import { Transaction } from "sequelize";
import { InputSectionInterface, SectionInterface } from "../interfaces";
import Models from "../models";

export class SectionRepository {
  public async findAllByCourse(courseId: number): Promise<SectionInterface[]> {
    return Models.Sections.findAll({
      where: { courseId },
      order: [["orderIndex", "ASC"]],
    });
  }

  public async findById(id: number): Promise<SectionInterface | null> {
    return Models.Sections.findByPk(id);
  }

  public async findNextIndex(courseId: number): Promise<number> {
    const last = await Models.Sections.findOne({
      where: { courseId },
      order: [["orderIndex", "DESC"]],
      attributes: ["orderIndex"],
    });
    return last ? last.orderIndex + 1 : 0;
  }

  public async create(data: InputSectionInterface): Promise<SectionInterface> {
    return Models.Sections.create(data);
  }

  public async update(id: number, data: Partial<InputSectionInterface>, transaction?: Transaction): Promise<void> {
    await Models.Sections.update(data, { where: { id }, transaction });
  }

  public async delete(id: number): Promise<boolean> {
    return (await Models.Sections.destroy({ where: { id } })) > 0;
  }
}
