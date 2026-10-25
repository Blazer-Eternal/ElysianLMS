import swaggerUi from "swagger-ui-express";
import { RoleEnum } from "../enums/roleEnum";
import { CourseStatusEnum } from "../enums/courseStatusEnum";
import { OrderStatusEnum } from "../enums/orderStatusEnum";
import { PaymentGatewayEnum } from "../enums/paymentGatewayEnum";
import { StaffRoleEnum } from "../enums/staffRoleEnum";
import { VideoProviderEnum } from "../enums/videoProviderEnum";

// ---------------------------------------------------------------------------
// Shared building blocks
// ---------------------------------------------------------------------------

// Every authenticated endpoint reads the JWT access token from this header.
const bearerAuth = {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
  description: "Paste the `token` returned by POST /api/auth/login (no `Bearer ` prefix needed — the UI adds it).",
};

// The default local port comes from PORT in .env (server.ts falls back to 5000).
const serverUrl = `http://localhost:${process.env.PORT || 5000}`;

const errorResponse = (description: string) => ({
  description,
  content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
});

const validationErrorResponse = () => ({
  description: "Validation failed",
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/ValidationError" },
    },
  },
});

// Success envelope used across the API: { success, message?, data? }
const ok = (description: string, dataSchema?: unknown) => ({
  description,
  content: {
    "application/json": {
      schema: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string" },
          ...(dataSchema ? { data: dataSchema } : {}),
        },
      },
    },
  },
});

const idParam = (name: string, description: string) => ({
  name,
  in: "path",
  required: true,
  description,
  schema: { type: "integer" },
});

// ---------------------------------------------------------------------------
// OpenAPI document
// ---------------------------------------------------------------------------

const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "ElysianLMS API",
    version: "1.0.0",
    description:
      "REST API for the ElysianLMS learning platform: authentication, catalog, curriculum authoring, " +
      "enrollment, payments, quizzes, progress and dashboards.\n\n" +
      "**Auth model.** Login returns a short-lived JWT `token` plus an opaque `refreshToken`. " +
      "Send the access token as `Authorization: Bearer <token>` on protected routes. " +
      "Refresh tokens rotate on every use and are stored hashed server-side.\n\n" +
      "**Roles.** `student`, `teacher`, `admin`. Some endpoints are gated by coarse role at the route; " +
      "others (curriculum, staff, enrollments) are scoped per-course inside the service, so a " +
      "teaching assistant with role `student` can still manage their assigned courses.",
    contact: { name: "ElysianLMS" },
    license: { name: "UNLICENSED" },
  },
  servers: [{ url: serverUrl, description: "Local development server" }],
  tags: [
    { name: "Health", description: "Liveness / database check" },
    { name: "Auth", description: "Signup, login, token refresh, password reset" },
    { name: "Users", description: "Admin user management" },
    { name: "Categories", description: "Course categories" },
    { name: "Courses", description: "Course catalog and authoring" },
    { name: "Course Staff", description: "Per-course TA / co-teacher membership" },
    { name: "Sections", description: "Course curriculum sections" },
    { name: "Lessons", description: "Lessons within a section" },
    { name: "Enrollments", description: "Student enrollments" },
    { name: "Orders", description: "Payments and refunds" },
    { name: "Reviews", description: "Course reviews and ratings" },
    { name: "Progress", description: "Lesson completion tracking" },
    { name: "Quizzes", description: "Quiz authoring and taking" },
    { name: "Dashboard", description: "Role-scoped aggregate dashboards" },
  ],
  components: {
    securitySchemes: { bearerAuth },
    parameters: {
      IdPath: {
        name: "id",
        in: "path",
        required: true,
        description: "Resource id",
        schema: { type: "integer" },
      },
    },
    schemas: {
      // ---- generic envelopes ------------------------------------------------
      Error: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Invalid credentials!" },
          fields: { type: "array", items: { type: "string" }, description: "Present on unique-constraint conflicts" },
        },
      },
      ValidationError: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Validation failed" },
          errors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                field: { type: "string", example: "email" },
                message: { type: "string", example: "Invalid email" },
              },
            },
          },
        },
      },
      Pagination: {
        type: "object",
        properties: {
          page: { type: "integer", example: 1 },
          limit: { type: "integer", example: 12 },
          total: { type: "integer", example: 42 },
          totalPages: { type: "integer", example: 4 },
        },
      },

      // ---- enums ------------------------------------------------------------
      Role: { type: "string", enum: Object.values(RoleEnum) },
      CourseStatus: { type: "string", enum: Object.values(CourseStatusEnum) },
      OrderStatus: { type: "string", enum: Object.values(OrderStatusEnum) },
      PaymentGateway: { type: "string", enum: Object.values(PaymentGatewayEnum) },
      StaffRole: { type: "string", enum: Object.values(StaffRoleEnum) },
      VideoProvider: { type: "string", enum: Object.values(VideoProviderEnum) },

      // ---- entities ---------------------------------------------------------
      User: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string", example: "Sarah Johnson" },
          email: { type: "string", format: "email", example: "sarah@example.com" },
          role: { $ref: "#/components/schemas/Role" },
          avatarUrl: { type: "string", nullable: true },
          isBanned: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      AuthUser: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          email: { type: "string", format: "email" },
          role: { $ref: "#/components/schemas/Role" },
        },
      },
      Category: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string", example: "Web Development" },
          slug: { type: "string", example: "web-development" },
        },
      },
      Course: {
        type: "object",
        properties: {
          id: { type: "integer" },
          teacherId: { type: "integer" },
          categoryId: { type: "integer", nullable: true },
          title: { type: "string", example: "React from Scratch" },
          slug: { type: "string", example: "react-from-scratch" },
          description: { type: "string" },
          price: { type: "number", example: 0 },
          thumbnailUrl: { type: "string", nullable: true },
          status: { $ref: "#/components/schemas/CourseStatus" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      CourseStaff: {
        type: "object",
        properties: {
          id: { type: "integer" },
          courseId: { type: "integer" },
          userId: { type: "integer" },
          staffRole: { $ref: "#/components/schemas/StaffRole" },
        },
      },
      Section: {
        type: "object",
        properties: {
          id: { type: "integer" },
          courseId: { type: "integer" },
          title: { type: "string", example: "Getting Started" },
          orderIndex: { type: "integer" },
        },
      },
      Lesson: {
        type: "object",
        properties: {
          id: { type: "integer" },
          sectionId: { type: "integer" },
          title: { type: "string", example: "Introduction" },
          content: { type: "string", nullable: true },
          videoProvider: { $ref: "#/components/schemas/VideoProvider" },
          videoRef: { type: "string", nullable: true },
          isPreview: { type: "boolean" },
          orderIndex: { type: "integer" },
        },
      },
      Enrollment: {
        type: "object",
        properties: {
          id: { type: "integer" },
          courseId: { type: "integer" },
          userId: { type: "integer" },
          source: { type: "string", example: "free | order | grant" },
        },
      },
      Order: {
        type: "object",
        properties: {
          id: { type: "integer" },
          userId: { type: "integer" },
          courseId: { type: "integer" },
          amount: { type: "number", example: 49.99 },
          gateway: { $ref: "#/components/schemas/PaymentGateway" },
          status: { $ref: "#/components/schemas/OrderStatus" },
          transactionId: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Review: {
        type: "object",
        properties: {
          id: { type: "integer" },
          courseId: { type: "integer" },
          userId: { type: "integer" },
          rating: { type: "integer", minimum: 1, maximum: 5 },
          comment: { type: "string", nullable: true },
        },
      },
      ReviewSummary: {
        type: "object",
        properties: {
          averageRating: { type: "number", example: 4.5 },
          count: { type: "integer", example: 12 },
        },
      },
      Progress: {
        type: "object",
        properties: {
          lessonId: { type: "integer" },
          courseId: { type: "integer" },
          completed: { type: "boolean" },
          completedAt: { type: "string", format: "date-time", nullable: true },
        },
      },
      QuizOption: {
        type: "object",
        properties: {
          id: { type: "integer" },
          optionText: { type: "string" },
          // only present in the staff view
          isCorrect: { type: "boolean" },
        },
      },
      QuizQuestion: {
        type: "object",
        properties: {
          id: { type: "integer" },
          questionText: { type: "string" },
          orderIndex: { type: "integer" },
          options: { type: "array", items: { $ref: "#/components/schemas/QuizOption" } },
        },
      },
      Quiz: {
        type: "object",
        properties: {
          id: { type: "integer" },
          lessonId: { type: "integer" },
          title: { type: "string" },
          passScore: { type: "integer", example: 70 },
          questions: { type: "array", items: { $ref: "#/components/schemas/QuizQuestion" } },
        },
      },
      QuizAttempt: {
        type: "object",
        properties: {
          id: { type: "integer" },
          quizId: { type: "integer" },
          userId: { type: "integer" },
          score: { type: "number", example: 80 },
          passed: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
        },
      },

      // ---- auth request bodies ---------------------------------------------
      SignupRequest: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", minLength: 1, maxLength: 100, example: "Alex Brown" },
          email: { type: "string", format: "email", example: "alex@example.com" },
          password: { type: "string", minLength: 8, maxLength: 72, description: "bcrypt input limit is 72 bytes" },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string" },
        },
      },
      RefreshRequest: {
        type: "object",
        required: ["refreshToken"],
        properties: { refreshToken: { type: "string", minLength: 20, maxLength: 512 } },
      },
      LogoutRequest: {
        type: "object",
        properties: { refreshToken: { type: "string", minLength: 20, maxLength: 512, description: "Optional — omit to just discard client-side" } },
      },
      ForgotPasswordRequest: {
        type: "object",
        required: ["email"],
        properties: { email: { type: "string", format: "email" } },
      },
      ResetPasswordRequest: {
        type: "object",
        required: ["token", "newPassword"],
        properties: {
          token: { type: "string", minLength: 20, maxLength: 512 },
          newPassword: { type: "string", minLength: 8, maxLength: 72 },
        },
      },
      ChangePasswordRequest: {
        type: "object",
        required: ["currentPassword", "newPassword"],
        properties: {
          currentPassword: { type: "string" },
          newPassword: { type: "string", minLength: 8, maxLength: 72 },
        },
      },
      LoginResponse: {
        type: "object",
        properties: {
          token: { type: "string", description: "JWT access token" },
          refreshToken: { type: "string" },
          refreshTokenExpiresAt: { type: "string", format: "date-time" },
          user: { $ref: "#/components/schemas/AuthUser" },
        },
      },
      RefreshResponse: {
        type: "object",
        properties: {
          token: { type: "string" },
          refreshToken: { type: "string" },
          refreshTokenExpiresAt: { type: "string", format: "date-time" },
        },
      },

      // ---- resource request bodies ------------------------------------------
      AssignRoleRequest: {
        type: "object",
        required: ["role"],
        properties: { role: { $ref: "#/components/schemas/Role" } },
      },
      CreateCategoryRequest: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", minLength: 1, maxLength: 100 },
          slug: { type: "string", pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$", description: "Auto-generated from name if omitted" },
        },
      },
      UpdateCategoryRequest: {
        type: "object",
        minProperties: 1,
        properties: {
          name: { type: "string", minLength: 1, maxLength: 100 },
          slug: { type: "string", pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$" },
        },
      },
      CreateCourseRequest: {
        type: "object",
        required: ["title"],
        properties: {
          title: { type: "string", minLength: 1, maxLength: 200 },
          slug: { type: "string", pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$", description: "Auto-generated from title if omitted" },
          description: { type: "string" },
          price: { type: "number", minimum: 0, default: 0 },
          thumbnailUrl: { type: "string", format: "uri", nullable: true },
          categoryId: { type: "integer", nullable: true },
        },
      },
      UpdateCourseRequest: {
        type: "object",
        minProperties: 1,
        properties: {
          title: { type: "string", minLength: 1, maxLength: 200 },
          slug: { type: "string", pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$" },
          description: { type: "string" },
          price: { type: "number", minimum: 0 },
          thumbnailUrl: { type: "string", format: "uri", nullable: true },
          categoryId: { type: "integer", nullable: true },
        },
      },
      CourseStatusRequest: {
        type: "object",
        required: ["status"],
        properties: { status: { $ref: "#/components/schemas/CourseStatus" } },
      },
      AssignStaffRequest: {
        type: "object",
        required: ["userId"],
        properties: {
          userId: { type: "integer" },
          staffRole: { $ref: "#/components/schemas/StaffRole" },
        },
      },
      UpdateStaffRequest: {
        type: "object",
        required: ["staffRole"],
        properties: { staffRole: { $ref: "#/components/schemas/StaffRole" } },
      },
      CreateSectionRequest: {
        type: "object",
        required: ["title"],
        properties: {
          title: { type: "string", minLength: 1, maxLength: 200 },
          orderIndex: { type: "integer", minimum: 0 },
        },
      },
      UpdateSectionRequest: {
        type: "object",
        minProperties: 1,
        properties: {
          title: { type: "string", minLength: 1, maxLength: 200 },
          orderIndex: { type: "integer", minimum: 0 },
        },
      },
      ReorderRequest: {
        type: "object",
        required: ["orderIndex"],
        properties: { orderIndex: { type: "integer", minimum: 0 } },
      },
      CreateLessonRequest: {
        type: "object",
        required: ["title"],
        description: "`videoProvider` and `videoRef` must be provided together (or both omitted).",
        properties: {
          title: { type: "string", minLength: 1, maxLength: 200 },
          videoProvider: { $ref: "#/components/schemas/VideoProvider" },
          videoRef: { type: "string", minLength: 1 },
          content: { type: "string", nullable: true },
          isPreview: { type: "boolean", default: false },
          orderIndex: { type: "integer", minimum: 0 },
        },
      },
      UpdateLessonRequest: {
        type: "object",
        minProperties: 1,
        properties: {
          title: { type: "string", minLength: 1, maxLength: 200 },
          videoProvider: { $ref: "#/components/schemas/VideoProvider" },
          videoRef: { type: "string", minLength: 1 },
          content: { type: "string", nullable: true },
          isPreview: { type: "boolean" },
          orderIndex: { type: "integer", minimum: 0 },
        },
      },
      MoveLessonRequest: {
        type: "object",
        required: ["sectionId"],
        properties: {
          sectionId: { type: "integer" },
          orderIndex: { type: "integer", minimum: 0 },
        },
      },
      CreateOrderRequest: {
        type: "object",
        required: ["courseId", "gateway"],
        properties: {
          courseId: { type: "integer" },
          gateway: { $ref: "#/components/schemas/PaymentGateway" },
        },
      },
      ConfirmOrderRequest: {
        type: "object",
        properties: {
          transactionId: { type: "string", maxLength: 100 },
          gatewayResponse: { type: "object", additionalProperties: true },
        },
      },
      GatewayResponseRequest: {
        type: "object",
        properties: { gatewayResponse: { type: "object", additionalProperties: true } },
      },
      EnrollRequest: {
        type: "object",
        required: ["courseId"],
        properties: { courseId: { type: "integer" } },
      },
      GrantEnrollmentRequest: {
        type: "object",
        required: ["courseId", "userId"],
        properties: { courseId: { type: "integer" }, userId: { type: "integer" } },
      },
      CreateReviewRequest: {
        type: "object",
        required: ["courseId", "rating"],
        properties: {
          courseId: { type: "integer" },
          rating: { type: "integer", minimum: 1, maximum: 5 },
          comment: { type: "string", maxLength: 2000, nullable: true },
        },
      },
      UpdateReviewRequest: {
        type: "object",
        minProperties: 1,
        properties: {
          rating: { type: "integer", minimum: 1, maximum: 5 },
          comment: { type: "string", maxLength: 2000, nullable: true },
        },
      },
      ProgressRequest: {
        type: "object",
        required: ["lessonId"],
        properties: { lessonId: { type: "integer" } },
      },
      CreateQuizRequest: {
        type: "object",
        required: ["lessonId", "title"],
        properties: {
          lessonId: { type: "integer" },
          title: { type: "string", minLength: 1, maxLength: 200 },
          passScore: { type: "integer", minimum: 0, maximum: 100, default: 70 },
        },
      },
      UpdateQuizRequest: {
        type: "object",
        minProperties: 1,
        properties: {
          title: { type: "string", minLength: 1, maxLength: 200 },
          passScore: { type: "integer", minimum: 0, maximum: 100 },
        },
      },
      QuestionOptionInput: {
        type: "object",
        required: ["optionText"],
        properties: {
          optionText: { type: "string", minLength: 1, maxLength: 500 },
          isCorrect: { type: "boolean", description: "Exactly one option in the list must be true" },
        },
      },
      AddQuestionRequest: {
        type: "object",
        required: ["questionText", "options"],
        properties: {
          questionText: { type: "string", minLength: 1, maxLength: 2000 },
          orderIndex: { type: "integer", minimum: 0 },
          options: {
            type: "array",
            minItems: 2,
            maxItems: 8,
            items: { $ref: "#/components/schemas/QuestionOptionInput" },
          },
        },
      },
      ReplaceQuestionRequest: {
        type: "object",
        minProperties: 1,
        properties: {
          questionText: { type: "string", minLength: 1, maxLength: 2000 },
          options: {
            type: "array",
            minItems: 2,
            maxItems: 8,
            items: { $ref: "#/components/schemas/QuestionOptionInput" },
          },
        },
      },
      SubmitAttemptRequest: {
        type: "object",
        required: ["answers"],
        properties: {
          answers: {
            type: "array",
            minItems: 1,
            items: {
              type: "object",
              required: ["questionId"],
              properties: {
                questionId: { type: "integer" },
                optionId: { type: "integer", nullable: true, description: "null = skipped" },
              },
            },
          },
        },
      },
    },

    responses: {
      BadRequest: errorResponse("Invalid id or malformed request"),
      Unauthorized: errorResponse("Missing or invalid access token"),
      Forbidden: errorResponse("Authenticated but not allowed (wrong role / not course staff)"),
      NotFound: errorResponse("Resource not found"),
      Conflict: errorResponse("Unique-constraint or state conflict"),
      TooManyRequests: errorResponse("Rate limit exceeded"),
      InternalError: errorResponse("Internal server error"),
    },
  },

  // Auth applied per-operation via `security`, so public routes stay open.
  paths: {
    // ---------------- Health ----------------
    "/api/health": {
      get: {
        tags: ["Health"],
        summary: "Database liveness check",
        security: [],
        responses: {
          200: {
            description: "Database reachable",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                    dbTime: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
          500: { description: "Database error", content: { "application/json": { schema: { type: "object", properties: { status: { type: "string", example: "db error" } } } } } },
        },
      },
    },

    // ---------------- Auth ----------------
    "/api/auth/signup": {
      post: {
        tags: ["Auth"],
        summary: "Create a student account",
        description: "Everyone registers as `student`; admins promote users later. Rate-limited.",
        security: [],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/SignupRequest" } } } },
        responses: {
          201: ok("Signup successful", { $ref: "#/components/schemas/AuthUser" }),
          409: { $ref: "#/components/responses/Conflict" },
          429: { $ref: "#/components/responses/TooManyRequests" },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Exchange credentials for tokens",
        security: [],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/LoginRequest" } } } },
        responses: {
          200: ok("Login successful", { $ref: "#/components/schemas/LoginResponse" }),
          401: errorResponse("Invalid credentials"),
          403: errorResponse("Account banned"),
          429: { $ref: "#/components/responses/TooManyRequests" },
        },
      },
    },
    "/api/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Rotate the refresh token for a new pair",
        description: "Strict single-use rotation: replaying a consumed token returns 401.",
        security: [],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/RefreshRequest" } } } },
        responses: {
          200: ok("Session refreshed", { $ref: "#/components/schemas/RefreshResponse" }),
          401: errorResponse("Invalid or expired session"),
        },
      },
    },
    "/api/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Revoke a refresh token",
        security: [],
        requestBody: { required: false, content: { "application/json": { schema: { $ref: "#/components/schemas/LogoutRequest" } } } },
        responses: { 200: ok("Logout successful") },
      },
    },
    "/api/auth/forgot-password": {
      post: {
        tags: ["Auth"],
        summary: "Request a password reset link",
        description: "Returns the same response whether or not the email exists (no account enumeration). In development the reset token is echoed in `data`.",
        security: [],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/ForgotPasswordRequest" } } } },
        responses: {
          200: ok("If an account with that email exists, a reset link has been sent"),
          429: { $ref: "#/components/responses/TooManyRequests" },
        },
      },
    },
    "/api/auth/reset-password": {
      post: {
        tags: ["Auth"],
        summary: "Reset a password with a single-use token",
        security: [],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/ResetPasswordRequest" } } } },
        responses: {
          200: ok("Password reset; all sessions logged out"),
          400: errorResponse("Invalid or expired reset token"),
        },
      },
    },
    "/api/auth/change-password": {
      patch: {
        tags: ["Auth"],
        summary: "Change your own password",
        description: "Requires the current password. Logs out every other session.",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/ChangePasswordRequest" } } } },
        responses: {
          200: ok("Password changed"),
          400: errorResponse("Current password incorrect"),
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },

    // ---------------- Users (admin) ----------------
    "/api/user": {
      get: {
        tags: ["Users"],
        summary: "List all users",
        description: "Admin only.",
        security: [{ bearerAuth: [] }],
        responses: {
          200: ok("Users", { type: "array", items: { $ref: "#/components/schemas/User" } }),
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
    },
    "/api/user/{id}/role": {
      patch: {
        tags: ["Users"],
        summary: "Assign a role to a user",
        description: "Admin only. Promote a student to teacher or admin.",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/IdPath" }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/AssignRoleRequest" } } } },
        responses: {
          200: ok("Role updated", { type: "object", properties: { id: { type: "integer" }, role: { $ref: "#/components/schemas/Role" } } }),
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/api/user/{id}": {
      delete: {
        tags: ["Users"],
        summary: "Delete a user",
        description: "Admin only.",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/IdPath" }],
        responses: {
          200: ok("User deleted"),
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
          409: { $ref: "#/components/responses/Conflict" },
        },
      },
    },

    // ---------------- Categories ----------------
    "/api/category": {
      get: {
        tags: ["Categories"],
        summary: "List all categories",
        security: [],
        responses: { 200: ok("Categories", { type: "array", items: { $ref: "#/components/schemas/Category" } }) },
      },
      post: {
        tags: ["Categories"],
        summary: "Create a category",
        description: "Admin only.",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreateCategoryRequest" } } } },
        responses: {
          201: ok("Category created", { $ref: "#/components/schemas/Category" }),
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
          409: { $ref: "#/components/responses/Conflict" },
        },
      },
    },
    "/api/category/{id}": {
      get: {
        tags: ["Categories"],
        summary: "Get a category by id",
        security: [],
        parameters: [{ $ref: "#/components/parameters/IdPath" }],
        responses: {
          200: ok("Category", { $ref: "#/components/schemas/Category" }),
          400: { $ref: "#/components/responses/BadRequest" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
      patch: {
        tags: ["Categories"],
        summary: "Update a category",
        description: "Admin only.",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/IdPath" }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateCategoryRequest" } } } },
        responses: {
          200: ok("Category updated", { $ref: "#/components/schemas/Category" }),
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
      delete: {
        tags: ["Categories"],
        summary: "Delete a category",
        description: "Admin only.",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/IdPath" }],
        responses: {
          200: ok("Category deleted"),
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
          409: { $ref: "#/components/responses/Conflict" },
        },
      },
    },

    // ---------------- Courses ----------------
    "/api/course": {
      get: {
        tags: ["Courses"],
        summary: "List published courses",
        description: "Public. Paginated and filterable by category.",
        security: [],
        parameters: [
          { name: "category", in: "query", description: "Filter by category id", schema: { type: "integer" } },
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 12, minimum: 1, maximum: 50 } },
        ],
        responses: {
          200: {
            description: "Published courses",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { type: "array", items: { $ref: "#/components/schemas/Course" } },
                    pagination: { $ref: "#/components/schemas/Pagination" },
                  },
                },
              },
            },
          },
          400: { $ref: "#/components/responses/BadRequest" },
        },
      },
      post: {
        tags: ["Courses"],
        summary: "Create a course",
        description: "Teacher or admin. Starts in `draft`.",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreateCourseRequest" } } } },
        responses: {
          201: ok("Course created", { $ref: "#/components/schemas/Course" }),
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
          409: { $ref: "#/components/responses/Conflict" },
        },
      },
    },
    "/api/course/mine": {
      get: {
        tags: ["Courses"],
        summary: "My courses (any status)",
        description: "Teacher or admin — every course they own.",
        security: [{ bearerAuth: [] }],
        responses: {
          200: ok("Courses", { type: "array", items: { $ref: "#/components/schemas/Course" } }),
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
    },
    "/api/course/{id}": {
      get: {
        tags: ["Courses"],
        summary: "Get a published course",
        security: [],
        parameters: [{ $ref: "#/components/parameters/IdPath" }],
        responses: {
          200: ok("Course", { $ref: "#/components/schemas/Course" }),
          400: { $ref: "#/components/responses/BadRequest" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
      patch: {
        tags: ["Courses"],
        summary: "Update course details",
        description: "Owner or admin.",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/IdPath" }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateCourseRequest" } } } },
        responses: {
          200: ok("Course updated", { $ref: "#/components/schemas/Course" }),
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
      delete: {
        tags: ["Courses"],
        summary: "Delete a course",
        description: "Owner or admin.",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/IdPath" }],
        responses: {
          200: ok("Course deleted"),
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
    },
    "/api/course/{id}/status": {
      patch: {
        tags: ["Courses"],
        summary: "Change course status",
        description: "Owner or admin. Drives the draft → pending → published workflow.",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/IdPath" }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CourseStatusRequest" } } } },
        responses: {
          200: ok("Course status updated", { $ref: "#/components/schemas/Course" }),
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
    },

    // ---------------- Course staff ----------------
    "/api/course/{courseId}/staff": {
      get: {
        tags: ["Course Staff"],
        summary: "List a course's staff",
        description: "Any authenticated user passes the door; the service verifies owner/admin/staff-of-this-course.",
        security: [{ bearerAuth: [] }],
        parameters: [idParam("courseId", "Course id")],
        responses: {
          200: ok("Staff memberships", { type: "array", items: { $ref: "#/components/schemas/CourseStaff" } }),
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
      post: {
        tags: ["Course Staff"],
        summary: "Assign staff to a course",
        description: "Owner or admin of the course.",
        security: [{ bearerAuth: [] }],
        parameters: [idParam("courseId", "Course id")],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/AssignStaffRequest" } } } },
        responses: {
          201: ok("Staff assigned", { $ref: "#/components/schemas/CourseStaff" }),
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
          409: { $ref: "#/components/responses/Conflict" },
        },
      },
    },
    "/api/course/{courseId}/staff/{userId}": {
      patch: {
        tags: ["Course Staff"],
        summary: "Update a staff member's role",
        security: [{ bearerAuth: [] }],
        parameters: [idParam("courseId", "Course id"), idParam("userId", "User id")],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateStaffRequest" } } } },
        responses: {
          200: ok("Staff role updated"),
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
      delete: {
        tags: ["Course Staff"],
        summary: "Remove a staff member",
        security: [{ bearerAuth: [] }],
        parameters: [idParam("courseId", "Course id"), idParam("userId", "User id")],
        responses: {
          200: ok("Staff removed"),
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
    },

    // ---------------- Sections ----------------
    "/api/course/{courseId}/sections": {
      get: {
        tags: ["Sections"],
        summary: "List a course's sections",
        security: [{ bearerAuth: [] }],
        parameters: [idParam("courseId", "Course id")],
        responses: {
          200: ok("Sections", { type: "array", items: { $ref: "#/components/schemas/Section" } }),
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
      post: {
        tags: ["Sections"],
        summary: "Create a section",
        description: "Course staff only (checked in service).",
        security: [{ bearerAuth: [] }],
        parameters: [idParam("courseId", "Course id")],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreateSectionRequest" } } } },
        responses: {
          201: ok("Section created", { $ref: "#/components/schemas/Section" }),
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
    },
    "/api/section/{id}": {
      patch: {
        tags: ["Sections"],
        summary: "Update a section",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/IdPath" }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateSectionRequest" } } } },
        responses: {
          200: ok("Section updated"),
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
      delete: {
        tags: ["Sections"],
        summary: "Delete a section",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/IdPath" }],
        responses: {
          200: ok("Section deleted"),
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
    },
    "/api/section/{id}/reorder": {
      patch: {
        tags: ["Sections"],
        summary: "Move a section to a new position",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/IdPath" }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/ReorderRequest" } } } },
        responses: {
          200: ok("Section reordered"),
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
    },

    // ---------------- Lessons ----------------
    "/api/section/{sectionId}/lessons": {
      get: {
        tags: ["Lessons"],
        summary: "List a section's lessons",
        security: [{ bearerAuth: [] }],
        parameters: [idParam("sectionId", "Section id")],
        responses: {
          200: ok("Lessons", { type: "array", items: { $ref: "#/components/schemas/Lesson" } }),
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
      post: {
        tags: ["Lessons"],
        summary: "Create a lesson",
        description: "Course staff only.",
        security: [{ bearerAuth: [] }],
        parameters: [idParam("sectionId", "Section id")],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreateLessonRequest" } } } },
        responses: {
          201: ok("Lesson created", { $ref: "#/components/schemas/Lesson" }),
          400: validationErrorResponse(),
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
    },
    "/api/lesson/{id}": {
      get: {
        tags: ["Lessons"],
        summary: "Get a lesson for viewing",
        description: "Public for preview lessons; enrolled students (or staff) see the rest. Uses optional auth.",
        security: [],
        parameters: [{ $ref: "#/components/parameters/IdPath" }],
        responses: {
          200: ok("Lesson", { $ref: "#/components/schemas/Lesson" }),
          400: { $ref: "#/components/responses/BadRequest" },
          403: errorResponse("Not enrolled and not a preview lesson"),
        },
      },
      patch: {
        tags: ["Lessons"],
        summary: "Update a lesson",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/IdPath" }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateLessonRequest" } } } },
        responses: {
          200: ok("Lesson updated"),
          400: validationErrorResponse(),
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
      delete: {
        tags: ["Lessons"],
        summary: "Delete a lesson",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/IdPath" }],
        responses: {
          200: ok("Lesson deleted"),
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
    },
    "/api/lesson/{id}/move": {
      patch: {
        tags: ["Lessons"],
        summary: "Move a lesson to another section",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/IdPath" }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/MoveLessonRequest" } } } },
        responses: {
          200: ok("Lesson moved"),
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
    },
    "/api/lesson/{id}/reorder": {
      patch: {
        tags: ["Lessons"],
        summary: "Move a lesson to a new position",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/IdPath" }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/ReorderRequest" } } } },
        responses: {
          200: ok("Lesson reordered"),
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
    },

    // ---------------- Enrollments ----------------
    "/api/enrollment": {
      post: {
        tags: ["Enrollments"],
        summary: "Self-enroll in a free course",
        description: "Any authenticated user. Paid courses go through Orders instead.",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/EnrollRequest" } } } },
        responses: {
          201: ok("Enrolled successfully", { $ref: "#/components/schemas/Enrollment" }),
          400: errorResponse("Course is not free"),
          401: { $ref: "#/components/responses/Unauthorized" },
          409: { $ref: "#/components/responses/Conflict" },
        },
      },
    },
    "/api/enrollment/mine": {
      get: {
        tags: ["Enrollments"],
        summary: "My enrollments",
        security: [{ bearerAuth: [] }],
        responses: {
          200: ok("Enrollments", { type: "array", items: { $ref: "#/components/schemas/Enrollment" } }),
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/api/enrollment/course/{courseId}": {
      get: {
        tags: ["Enrollments"],
        summary: "The enrollment roster for a course",
        description: "Course staff (checked in service).",
        security: [{ bearerAuth: [] }],
        parameters: [idParam("courseId", "Course id")],
        responses: {
          200: ok("Enrollments", { type: "array", items: { $ref: "#/components/schemas/Enrollment" } }),
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
    },
    "/api/enrollment/grant": {
      post: {
        tags: ["Enrollments"],
        summary: "Grant an enrollment (comp / scholarship)",
        description: "Admin only.",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/GrantEnrollmentRequest" } } } },
        responses: {
          201: ok("Enrollment granted", { $ref: "#/components/schemas/Enrollment" }),
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
    },
    "/api/enrollment/{id}": {
      delete: {
        tags: ["Enrollments"],
        summary: "Revoke a free enrollment",
        description: "Admin only. Paid enrollments must be refunded via Orders instead.",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/IdPath" }],
        responses: {
          200: ok("Enrollment revoked"),
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
          409: errorResponse("Paid enrollment — refund via Orders"),
        },
      },
    },

    // ---------------- Orders ----------------
    "/api/order": {
      get: {
        tags: ["Orders"],
        summary: "Reconciliation queue by status",
        description: "Admin only.",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "status", in: "query", required: true, schema: { $ref: "#/components/schemas/OrderStatus" } }],
        responses: {
          200: ok("Orders", { type: "array", items: { $ref: "#/components/schemas/Order" } }),
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
      post: {
        tags: ["Orders"],
        summary: "Create an order for a paid course",
        description: "Returns a pending order to be completed at the gateway.",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreateOrderRequest" } } } },
        responses: {
          201: ok("Order created", { $ref: "#/components/schemas/Order" }),
          400: errorResponse("Course not purchasable"),
          401: { $ref: "#/components/responses/Unauthorized" },
          409: { $ref: "#/components/responses/Conflict" },
        },
      },
    },
    "/api/order/mine": {
      get: {
        tags: ["Orders"],
        summary: "My orders",
        security: [{ bearerAuth: [] }],
        responses: {
          200: ok("Orders", { type: "array", items: { $ref: "#/components/schemas/Order" } }),
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/api/order/{id}": {
      get: {
        tags: ["Orders"],
        summary: "Get one order",
        description: "Any authenticated user sees only their own; admins see any.",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/IdPath" }],
        responses: {
          200: ok("Order", { $ref: "#/components/schemas/Order" }),
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/api/order/{id}/confirm": {
      patch: {
        tags: ["Orders"],
        summary: "Confirm a payment (admin)",
        description: "Admin only. Until gateway webhooks exist, payments are confirmed manually. Creates the enrollment.",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/IdPath" }],
        requestBody: { required: false, content: { "application/json": { schema: { $ref: "#/components/schemas/ConfirmOrderRequest" } } } },
        responses: {
          200: {
            description: "Payment confirmed",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    message: { type: "string" },
                    data: {
                      type: "object",
                      properties: { order: { $ref: "#/components/schemas/Order" }, enrollmentId: { type: "integer" } },
                    },
                  },
                },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
          409: errorResponse("Order not in a confirmable state"),
        },
      },
    },
    "/api/order/{id}/fail": {
      patch: {
        tags: ["Orders"],
        summary: "Mark an order as failed (admin)",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/IdPath" }],
        requestBody: { required: false, content: { "application/json": { schema: { $ref: "#/components/schemas/GatewayResponseRequest" } } } },
        responses: {
          200: ok("Order marked as failed", { $ref: "#/components/schemas/Order" }),
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
    },
    "/api/order/{id}/refund": {
      patch: {
        tags: ["Orders"],
        summary: "Refund an order (admin)",
        description: "Marks the order refunded and revokes the associated enrollment.",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/IdPath" }],
        requestBody: { required: false, content: { "application/json": { schema: { $ref: "#/components/schemas/GatewayResponseRequest" } } } },
        responses: {
          200: {
            description: "Order refunded",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    message: { type: "string" },
                    data: {
                      type: "object",
                      properties: { order: { $ref: "#/components/schemas/Order" }, enrollmentRevoked: { type: "boolean" } },
                    },
                  },
                },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
          409: errorResponse("Order not refundable"),
        },
      },
    },

    // ---------------- Reviews ----------------
    "/api/course/{courseId}/reviews": {
      get: {
        tags: ["Reviews"],
        summary: "Reviews and average rating for a course",
        security: [],
        parameters: [idParam("courseId", "Course id")],
        responses: {
          200: {
            description: "Reviews plus a rating summary",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { type: "array", items: { $ref: "#/components/schemas/Review" } },
                    summary: { $ref: "#/components/schemas/ReviewSummary" },
                  },
                },
              },
            },
          },
          400: { $ref: "#/components/responses/BadRequest" },
        },
      },
    },
    "/api/review": {
      post: {
        tags: ["Reviews"],
        summary: "Submit a review",
        description: "Enrolled students only (checked in service). One review per user per course.",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreateReviewRequest" } } } },
        responses: {
          201: ok("Review submitted", { $ref: "#/components/schemas/Review" }),
          401: { $ref: "#/components/responses/Unauthorized" },
          403: errorResponse("Not enrolled"),
          409: { $ref: "#/components/responses/Conflict" },
        },
      },
    },
    "/api/review/{id}": {
      patch: {
        tags: ["Reviews"],
        summary: "Update your review",
        description: "Author or admin.",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/IdPath" }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateReviewRequest" } } } },
        responses: {
          200: ok("Review updated"),
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
      delete: {
        tags: ["Reviews"],
        summary: "Delete a review",
        description: "Author or admin.",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/IdPath" }],
        responses: {
          200: ok("Review deleted"),
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
    },

    // ---------------- Progress ----------------
    "/api/progress/complete": {
      post: {
        tags: ["Progress"],
        summary: "Mark a lesson complete",
        description: "Enrolled students. Idempotent — safe to retry.",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/ProgressRequest" } } } },
        responses: {
          200: ok("Already completed"),
          201: ok("Marked complete", { $ref: "#/components/schemas/Progress" }),
          401: { $ref: "#/components/responses/Unauthorized" },
          403: errorResponse("Not enrolled"),
        },
      },
    },
    "/api/progress/incomplete": {
      post: {
        tags: ["Progress"],
        summary: "Mark a lesson incomplete",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/ProgressRequest" } } } },
        responses: {
          200: ok("Lesson marked as incomplete"),
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/api/progress/course/{courseId}": {
      get: {
        tags: ["Progress"],
        summary: "My progress in a course",
        security: [{ bearerAuth: [] }],
        parameters: [idParam("courseId", "Course id")],
        responses: {
          200: ok("Progress", { type: "object", additionalProperties: true }),
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },

    // ---------------- Quizzes ----------------
    "/api/quiz": {
      post: {
        tags: ["Quizzes"],
        summary: "Create a quiz for a lesson",
        description: "Course staff only.",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreateQuizRequest" } } } },
        responses: {
          201: ok("Quiz saved", { $ref: "#/components/schemas/Quiz" }),
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
    },
    "/api/quiz/{id}": {
      get: {
        tags: ["Quizzes"],
        summary: "Get a quiz (student view)",
        description: "Enrolled students. `is_correct` is stripped from options.",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/IdPath" }],
        responses: {
          200: ok("Quiz", { $ref: "#/components/schemas/Quiz" }),
          401: { $ref: "#/components/responses/Unauthorized" },
          403: errorResponse("Not enrolled"),
        },
      },
      patch: {
        tags: ["Quizzes"],
        summary: "Update a quiz",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/IdPath" }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateQuizRequest" } } } },
        responses: {
          200: ok("Quiz updated"),
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
      delete: {
        tags: ["Quizzes"],
        summary: "Delete a quiz",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/IdPath" }],
        responses: {
          200: ok("Quiz deleted"),
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
    },
    "/api/quiz/{id}/staff": {
      get: {
        tags: ["Quizzes"],
        summary: "Get a quiz (staff view)",
        description: "Includes `is_correct` on each option.",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/IdPath" }],
        responses: {
          200: ok("Quiz", { $ref: "#/components/schemas/Quiz" }),
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
    },
    "/api/quiz/{id}/questions": {
      post: {
        tags: ["Quizzes"],
        summary: "Add a question to a quiz",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/IdPath" }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/AddQuestionRequest" } } } },
        responses: {
          201: ok("Question added", { $ref: "#/components/schemas/QuizQuestion" }),
          400: validationErrorResponse(),
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
    },
    "/api/quiz/question/{questionId}": {
      patch: {
        tags: ["Quizzes"],
        summary: "Replace a question's text and/or options",
        security: [{ bearerAuth: [] }],
        parameters: [idParam("questionId", "Question id")],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/ReplaceQuestionRequest" } } } },
        responses: {
          200: ok("Question updated"),
          400: validationErrorResponse(),
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
      delete: {
        tags: ["Quizzes"],
        summary: "Delete a question",
        security: [{ bearerAuth: [] }],
        parameters: [idParam("questionId", "Question id")],
        responses: {
          200: ok("Question deleted"),
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
    },
    "/api/quiz/{id}/attempts": {
      get: {
        tags: ["Quizzes"],
        summary: "Every attempt across students (staff)",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/IdPath" }],
        responses: {
          200: ok("Attempts", { type: "array", items: { $ref: "#/components/schemas/QuizAttempt" } }),
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
      post: {
        tags: ["Quizzes"],
        summary: "Submit an attempt",
        description: "Enrolled students. Scores and pass/fail are computed server-side.",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/IdPath" }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/SubmitAttemptRequest" } } } },
        responses: {
          201: {
            description: "Attempt submitted",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    message: { type: "string" },
                    data: {
                      type: "object",
                      properties: {
                        attempt: { $ref: "#/components/schemas/QuizAttempt" },
                        answers: { type: "array", items: { type: "object", additionalProperties: true } },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: errorResponse("Not enrolled"),
        },
      },
    },
    "/api/quiz/{id}/my-attempts": {
      get: {
        tags: ["Quizzes"],
        summary: "My attempt history for a quiz",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/IdPath" }],
        responses: {
          200: ok("Attempts", { type: "array", items: { $ref: "#/components/schemas/QuizAttempt" } }),
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },

    // ---------------- Dashboard ----------------
    "/api/dashboard/student": {
      get: {
        tags: ["Dashboard"],
        summary: "Student dashboard aggregates",
        description: "Scoped to the caller's identity in the service.",
        security: [{ bearerAuth: [] }],
        responses: {
          200: ok("Dashboard", { type: "object", additionalProperties: true }),
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/api/dashboard/teacher": {
      get: {
        tags: ["Dashboard"],
        summary: "Teacher dashboard aggregates",
        description: "Scoped to owned + staffed courses, so a TA with role `student` still sees their courses.",
        security: [{ bearerAuth: [] }],
        responses: {
          200: ok("Dashboard", { type: "object", additionalProperties: true }),
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/api/dashboard/admin": {
      get: {
        tags: ["Dashboard"],
        summary: "Admin dashboard (platform-wide)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: ok("Dashboard", { type: "object", additionalProperties: true }),
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
    },
  },
} as const;

export { swaggerSpec, swaggerUi };
