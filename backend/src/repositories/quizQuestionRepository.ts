import { Transaction } from "sequelize";
import { InputQuizQuestionInterface, QuizQuestionInterface } from "../interfaces";
import Models from "../models";

export class QuizQuestionRepository {
  public async findAllByQuiz(quizId: number): Promise<QuizQuestionInterface[]> {
    return Models.QuizQuestions.findAll({
      where: { quizId },
      order: [["orderIndex", "ASC"]],
    });
  }

  public async findById(id: number): Promise<QuizQuestionInterface | null> {
    return Models.QuizQuestions.findByPk(id);
  }

  public async findNextIndex(quizId: number): Promise<number> {
    const last = await Models.QuizQuestions.findOne({
      where: { quizId },
      order: [["orderIndex", "DESC"]],
      attributes: ["orderIndex"],
    });
    return last ? last.orderIndex + 1 : 0;
  }

  public async create(data: InputQuizQuestionInterface, transaction?: Transaction): Promise<QuizQuestionInterface> {
    return Models.QuizQuestions.create(data, { transaction });
  }

  public async update(id: number, data: Partial<InputQuizQuestionInterface>, transaction?: Transaction): Promise<void> {
    await Models.QuizQuestions.update(data, { where: { id }, transaction });
  }

  public async delete(id: number): Promise<boolean> {
    return (await Models.QuizQuestions.destroy({ where: { id } })) > 0;
  }
}
