import { CategoryInterface, InputCategoryInterface } from "../interfaces";
import Models from "../models";

export class CategoryRepository {
  public async findAll() {
    return Models.Categories.findAll({ order: [["name", "ASC"]] });
  }

  public async findById(id: number): Promise<CategoryInterface | null> {
    return Models.Categories.findByPk(id);
  }

  public async create(data: InputCategoryInterface): Promise<CategoryInterface> {
    return Models.Categories.create(data);
  }

  public async update(id: number, data: Partial<InputCategoryInterface>): Promise<CategoryInterface | null> {
    await Models.Categories.update(data, { where: { id } });
    return Models.Categories.findByPk(id);
  }

  public async delete(id: number): Promise<boolean> {
    return (await Models.Categories.destroy({ where: { id } })) > 0;
  }
}