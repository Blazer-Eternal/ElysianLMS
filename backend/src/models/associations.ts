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

// users 1 — * sessions
Users.hasMany(Sessions, { foreignKey: "userId", onDelete: "CASCADE" });
Sessions.belongsTo(Users, { foreignKey: "userId" });

// users 1 — * password_reset_tokens
Users.hasMany(PasswordResetTokens, { foreignKey: "userId", onDelete: "CASCADE" });
PasswordResetTokens.belongsTo(Users, { foreignKey: "userId" });

// users 1 — 0..1 email_otps (one active verification code per user)
Users.hasOne(EmailOtps, { foreignKey: "userId", as: "emailOtp", onDelete: "CASCADE" });
EmailOtps.belongsTo(Users, { foreignKey: "userId" });

// users (teacher) 1 — * courses
Users.hasMany(Courses, { foreignKey: "teacherId", as: "courses", onDelete: "RESTRICT" });
Courses.belongsTo(Users, { foreignKey: "teacherId", as: "teacher" });

// categories 1 — * courses
Categories.hasMany(Courses, { foreignKey: "categoryId", as: "courses", onDelete: "SET NULL" });
Courses.belongsTo(Categories, { foreignKey: "categoryId", as: "category" });

// courses 1 — * course_staff / users 1 — * course_staff
Courses.hasMany(CourseStaff, { foreignKey: "courseId", as: "staffMemberships", onDelete: "CASCADE" });
CourseStaff.belongsTo(Courses, { foreignKey: "courseId", as: "course" });
Users.hasMany(CourseStaff, { foreignKey: "userId", as: "staffMemberships", onDelete: "CASCADE" });
CourseStaff.belongsTo(Users, { foreignKey: "userId", as: "user" });

// courses 1 — * sections
Courses.hasMany(Sections, { foreignKey: "courseId", as: "sections", onDelete: "CASCADE" });
Sections.belongsTo(Courses, { foreignKey: "courseId", as: "course" });

// sections 1 — * lessons
Sections.hasMany(Lessons, { foreignKey: "sectionId", as: "lessons", onDelete: "CASCADE" });
Lessons.belongsTo(Sections, { foreignKey: "sectionId", as: "section" });

// users 1 — * orders / courses 1 — * orders
Users.hasMany(Orders, { foreignKey: "userId", as: "orders", onDelete: "RESTRICT" });
Orders.belongsTo(Users, { foreignKey: "userId", as: "user" });
Courses.hasMany(Orders, { foreignKey: "courseId", as: "orders", onDelete: "RESTRICT" });
Orders.belongsTo(Courses, { foreignKey: "courseId", as: "course" });

// users 1 — * enrollments / courses 1 — * enrollments / orders 1 — 0..1 enrollment
Users.hasMany(Enrollments, { foreignKey: "userId", as: "enrollments", onDelete: "RESTRICT" });
Enrollments.belongsTo(Users, { foreignKey: "userId", as: "user" });
Courses.hasMany(Enrollments, { foreignKey: "courseId", as: "enrollments", onDelete: "RESTRICT" });
Enrollments.belongsTo(Courses, { foreignKey: "courseId", as: "course" });
Orders.hasOne(Enrollments, { foreignKey: "orderId", as: "enrollment", onDelete: "RESTRICT" });
Enrollments.belongsTo(Orders, { foreignKey: "orderId", as: "order" });

// users 1 — * reviews / courses 1 — * reviews
Users.hasMany(Reviews, { foreignKey: "userId", as: "reviews", onDelete: "CASCADE" });
Reviews.belongsTo(Users, { foreignKey: "userId", as: "user" });
Courses.hasMany(Reviews, { foreignKey: "courseId", as: "reviews", onDelete: "CASCADE" });
Reviews.belongsTo(Courses, { foreignKey: "courseId", as: "course" });

// users 1 — * progress / lessons 1 — * progress
Users.hasMany(Progress, { foreignKey: "userId", as: "progressEntries", onDelete: "CASCADE" });
Progress.belongsTo(Users, { foreignKey: "userId", as: "user" });
Lessons.hasMany(Progress, { foreignKey: "lessonId", as: "progressEntries", onDelete: "CASCADE" });
Progress.belongsTo(Lessons, { foreignKey: "lessonId", as: "lesson" });

// lessons 1 — 0..1 quiz
Lessons.hasOne(Quizzes, { foreignKey: "lessonId", as: "quiz", onDelete: "CASCADE" });
Quizzes.belongsTo(Lessons, { foreignKey: "lessonId", as: "lesson" });

// quizzes 1 — * questions
Quizzes.hasMany(QuizQuestions, { foreignKey: "quizId", as: "questions", onDelete: "CASCADE" });
QuizQuestions.belongsTo(Quizzes, { foreignKey: "quizId", as: "quiz" });

// questions 1 — * options
QuizQuestions.hasMany(QuizOptions, { foreignKey: "questionId", as: "options", onDelete: "CASCADE" });
QuizOptions.belongsTo(QuizQuestions, { foreignKey: "questionId", as: "question" });

// quizzes 1 — * attempts / users 1 — * attempts
Quizzes.hasMany(QuizAttempts, { foreignKey: "quizId", as: "attempts", onDelete: "CASCADE" });
QuizAttempts.belongsTo(Quizzes, { foreignKey: "quizId", as: "quiz" });
Users.hasMany(QuizAttempts, { foreignKey: "userId", as: "quizAttempts", onDelete: "CASCADE" });
QuizAttempts.belongsTo(Users, { foreignKey: "userId", as: "user" });

// attempts 1 — * answers / questions 1 — * answers
QuizAttempts.hasMany(AttemptAnswers, { foreignKey: "attemptId", as: "answers", onDelete: "CASCADE" });
AttemptAnswers.belongsTo(QuizAttempts, { foreignKey: "attemptId", as: "attempt" });
QuizQuestions.hasMany(AttemptAnswers, { foreignKey: "questionId", as: "answers", onDelete: "CASCADE" });
AttemptAnswers.belongsTo(QuizQuestions, { foreignKey: "questionId", as: "question" });
QuizOptions.hasMany(AttemptAnswers, { foreignKey: "optionId", as: "answers" });
AttemptAnswers.belongsTo(QuizOptions, { foreignKey: "optionId", as: "option" });
