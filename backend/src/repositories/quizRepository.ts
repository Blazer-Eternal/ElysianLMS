import { InputQuizInterface, QuizInterface } from "../interfaces";
import Models from "../models";

export class QuizRepository {
  public async findByLessonId(lessonId: number): Promise<QuizInterface | null> {
    return Models.Quizzes.findOne({ where: { lessonId } });
  }

  public async findById(id: number): Promise<QuizInterface | null> {
    return Models.Quizzes.findByPk(id);
  }

  public async create(data: InputQuizInterface): Promise<QuizInterface> {
    return Models.Quizzes.create(data);
  }

  public async update(id: number, data: Partial<InputQuizInterface>): Promise<void> {
    await Models.Quizzes.update(data, { where: { id } });
  }

  public async delete(id: number): Promise<boolean> {
    return (await Models.Quizzes.destroy({ where: { id } })) > 0;
  }
}
