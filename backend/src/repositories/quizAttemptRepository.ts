import { Transaction } from "sequelize";
import { InputQuizAttemptInterface, QuizAttemptInterface } from "../interfaces";
import Models from "../models";

export class QuizAttemptRepository {
  public async findAllByQuizForUser(quizId: number, userId: number): Promise<QuizAttemptInterface[]> {
    return Models.QuizAttempts.findAll({
      where: { quizId, userId },
      order: [["submittedAt", "DESC"]],
    });
  }

  public async findAllByQuiz(quizId: number): Promise<QuizAttemptInterface[]> {
    return Models.QuizAttempts.findAll({
      where: { quizId },
      include: [{ model: Models.Users, as: "user", attributes: ["id", "name", "email"] }],
      order: [["submittedAt", "DESC"]],
    });
  }

  public async findById(id: number): Promise<QuizAttemptInterface | null> {
    return Models.QuizAttempts.findByPk(id);
  }

  public async findBestScore(quizId: number, userId: number): Promise<number | null> {
    const best = await Models.QuizAttempts.findOne({
      where: { quizId, userId },
      order: [["score", "DESC"]],
      attributes: ["score"],
    });
    return best ? best.score : null;
  }

  public async create(data: InputQuizAttemptInterface, transaction?: Transaction): Promise<QuizAttemptInterface> {
    return Models.QuizAttempts.create(data, { transaction });
  }
}
