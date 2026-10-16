import { Transaction } from "sequelize";
import { AttemptAnswerInterface, InputAttemptAnswerInterface } from "../interfaces";
import Models from "../models";

export class AttemptAnswerRepository {
  public async findAllByAttempt(attemptId: number): Promise<AttemptAnswerInterface[]> {
    return Models.AttemptAnswers.findAll({
      where: { attemptId },
      include: [{ model: Models.QuizOptions, as: "option", attributes: ["id", "optionText"] }],
      order: [["id", "ASC"]],
    });
  }

  public async bulkCreate(data: InputAttemptAnswerInterface[], transaction?: Transaction): Promise<AttemptAnswerInterface[]> {
    return Models.AttemptAnswers.bulkCreate(data, { transaction });
  }
}
