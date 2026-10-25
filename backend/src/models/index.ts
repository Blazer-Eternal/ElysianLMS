import Users from "./userModel";
import Categories from "./categoryModel";
import Courses from "./courseModel";
import Sessions from "./sessionModel";
import PasswordResetTokens from "./passwordResetTokenModel";
import CourseStaff from "./courseStaffModel";
import Sections from "./sectionModel";
import Lessons from "./lessonModel";
import Orders from "./orderModel";
import Enrollments from "./enrollmentModel";
import Reviews from "./reviewModel";
import Progress from "./progressModel";
import Quizzes from "./quizModel";
import QuizQuestions from "./quizQuestionModel";
import QuizOptions from "./quizOptionModel";
import QuizAttempts from "./quizAttemptModel";
import AttemptAnswers from "./attemptAnswerModel";
import EmailOtps from "./emailOtpModel";
import "./associations";

const Models = {
  Users,
  Categories,
  Courses,
  Sessions,
  PasswordResetTokens,
  CourseStaff,
  Sections,
  Lessons,
  Orders,
  Enrollments,
  Reviews,
  Progress,
  Quizzes,
  QuizQuestions,
  QuizOptions,
  QuizAttempts,
  AttemptAnswers,
  EmailOtps,
};

export default Models;
