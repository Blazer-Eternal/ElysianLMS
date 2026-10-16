import { Router } from "express";
import { QuizController } from "../controllers/quizControllers";
import { exceptionHandler, Guard, Validator } from "../../middleware";
import { createQuizValidator, updateQuizValidator, addQuestionValidator, replaceQuestionValidator, submitAttemptValidator } from "../../validators";

const quizRoutes = Router();

// ------------------------------------------------------------------
// Authoring — per-course staff membership decides, so only auth here
// ------------------------------------------------------------------

quizRoutes.post(
  "/quiz",
  exceptionHandler(Guard.grantAccess),
  exceptionHandler(Validator.check(createQuizValidator)),
  exceptionHandler(QuizController.createQuiz)
);

quizRoutes.patch(
  "/quiz/:id",
  exceptionHandler(Guard.grantAccess),
  exceptionHandler(Validator.check(updateQuizValidator)),
  exceptionHandler(QuizController.updateQuiz)
);

quizRoutes.delete(
  "/quiz/:id",
  exceptionHandler(Guard.grantAccess),
  exceptionHandler(QuizController.deleteQuiz)
);

// Staff view: includes is_correct
quizRoutes.get(
  "/quiz/:id/staff",
  exceptionHandler(Guard.grantAccess),
  exceptionHandler(QuizController.getQuizForStaff)
);

quizRoutes.post(
  "/quiz/:id/questions",
  exceptionHandler(Guard.grantAccess),
  exceptionHandler(Validator.check(addQuestionValidator)),
  exceptionHandler(QuizController.addQuestion)
);

quizRoutes.patch(
  "/quiz/question/:questionId",
  exceptionHandler(Guard.grantAccess),
  exceptionHandler(Validator.check(replaceQuestionValidator)),
  exceptionHandler(QuizController.replaceQuestion)
);

quizRoutes.delete(
  "/quiz/question/:questionId",
  exceptionHandler(Guard.grantAccess),
  exceptionHandler(QuizController.deleteQuestion)
);

// Staff: every attempt across students
quizRoutes.get(
  "/quiz/:id/attempts",
  exceptionHandler(Guard.grantAccess),
  exceptionHandler(QuizController.getQuizAttempts)
);

// ------------------------------------------------------------------
// Taking — enrolled students (checked in service)
// ------------------------------------------------------------------

// Student view: is_correct stripped
quizRoutes.get(
  "/quiz/:id",
  exceptionHandler(Guard.grantAccess),
  exceptionHandler(QuizController.getQuizForStudent)
);

quizRoutes.post(
  "/quiz/:id/attempts",
  exceptionHandler(Guard.grantAccess),
  exceptionHandler(Validator.check(submitAttemptValidator)),
  exceptionHandler(QuizController.submitAttempt)
);

// The student's own history
quizRoutes.get(
  "/quiz/:id/my-attempts",
  exceptionHandler(Guard.grantAccess),
  exceptionHandler(QuizController.getMyAttempts)
);

export default quizRoutes;
