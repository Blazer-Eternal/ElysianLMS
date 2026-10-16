import { Transaction } from "sequelize";
import { InputQuizOptionInterface, QuizOptionInterface } from "../interfaces";
import Models from "../models";

export class QuizOptionRepository {
  // answers: excludes is_correct so it can be given to students safely
  public async findAllByQuestion(questionId: number): Promise<QuizOptionInterface[]> {
    return Models.QuizOptions.findAll({
      where: { questionId },
      order: [["id", "ASC"]],
    });
  }

  public async create(data: InputQuizOptionInterface, transaction?: Transaction): Promise<QuizOptionInterface> {
    return Models.QuizOptions.create(data, { transaction });
  }

  public async deleteByQuestion(questionId: number, transaction?: Transaction): Promise<number> {
    return Models.QuizOptions.destroy({ where: { questionId }, transaction });
  }
}
