import { InputCategoryInterface } from "../interfaces";
import { CategoryRepository } from "../repositories";
import { AppError, slugify } from "../utils";

export class CategoryServices {
  private categoryRepository = new CategoryRepository();

  public async getAll() {
    return this.categoryRepository.findAll();
  }

  public async getById(id: number) {
    const category = await this.categoryRepository.findById(id);
    if (!category) throw new AppError(404, "Category not found");
    return category;
  }

  public async create(data: { name: string; slug?: string }) {
    const slug = data.slug ?? slugify(data.name, 120);
    if (!slug) throw new AppError(400, "Could not generate a slug, please provide one");

    return this.categoryRepository.create({ name: data.name, slug });
  }

  public async update(id: number, data: Partial<InputCategoryInterface>) {
    const category = await this.categoryRepository.update(id, data);
    if (!category) throw new AppError(404, "Category not found");
    return category;
  }

  public async delete(id: number): Promise<void> {
    if (!(await this.categoryRepository.delete(id))) {
      throw new AppError(404, "Category not found");
    }
  }
}