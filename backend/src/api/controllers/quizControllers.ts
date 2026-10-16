import { Request, Response } from "express";
import { CustomRequestInterface } from "../../interfaces";
import { QuizServices } from "../../services";
import { parseId } from "../../utils";

const quizServices = new QuizServices();

export class QuizController {
  // ---- authoring (course staff) ----

  static async createQuiz(req: CustomRequestInterface, res: Response) {
    const { lessonId, title, passScore } = req.body;
    const quiz = await quizServices.createQuiz(req.user, lessonId, { title, passScore });
    return res.status(201).json({ success: true, message: "Quiz saved", data: quiz });
  }

  static async updateQuiz(req: CustomRequestInterface, res: Response) {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Invalid quiz id" });

    await quizServices.updateQuiz(req.user, id, req.body);
    return res.status(200).json({ success: true, message: "Quiz updated" });
  }

  static async deleteQuiz(req: CustomRequestInterface, res: Response) {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Invalid quiz id" });

    await quizServices.deleteQuiz(req.user, id);
    return res.status(200).json({ success: true, message: "Quiz deleted" });
  }

  // staff view: includes is_correct
  static async getQuizForStaff(req: CustomRequestInterface, res: Response) {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Invalid quiz id" });

    const data = await quizServices.getQuizForStaff(req.user, id);
    return res.status(200).json({ success: true, data });
  }

  static async addQuestion(req: CustomRequestInterface, res: Response) {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Invalid quiz id" });

    const question = await quizServices.addQuestion(req.user, id, req.body);
    return res.status(201).json({ success: true, message: "Question added", data: question });
  }

  static async replaceQuestion(req: CustomRequestInterface, res: Response) {
    const id = parseId(req.params.questionId);
    if (!id) return res.status(400).json({ success: false, message: "Invalid question id" });

    await quizServices.replaceQuestionOptions(req.user, id, req.body);
    return res.status(200).json({ success: true, message: "Question updated" });
  }

  static async deleteQuestion(req: CustomRequestInterface, res: Response) {
    const id = parseId(req.params.questionId);
    if (!id) return res.status(400).json({ success: false, message: "Invalid question id" });

    await quizServices.deleteQuestion(req.user, id);
    return res.status(200).json({ success: true, message: "Question deleted" });
  }

  static async getQuizAttempts(req: CustomRequestInterface, res: Response) {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Invalid quiz id" });

    const attempts = await quizServices.getQuizAttempts(req.user, id);
    return res.status(200).json({ success: true, data: attempts });
  }

  // ---- taking (students) ----

  // student view: is_correct stripped
  static async getQuizForStudent(req: CustomRequestInterface, res: Response) {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Invalid quiz id" });

    const data = await quizServices.getQuizForStudent(req.user, id);
    return res.status(200).json({ success: true, data });
  }

  static async submitAttempt(req: CustomRequestInterface, res: Response) {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Invalid quiz id" });

    const { attempt, answers } = await quizServices.submitAttempt(req.user, id, req.body.answers);
    return res.status(201).json({ success: true, message: "Attempt submitted", data: { attempt, answers } });
  }

  static async getMyAttempts(req: CustomRequestInterface, res: Response) {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Invalid quiz id" });

    const attempts = await quizServices.getMyAttempts(req.user, id);
    return res.status(200).json({ success: true, data: attempts });
  }
}
