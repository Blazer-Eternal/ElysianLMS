import { CourseStatusEnum } from "../enums/courseStatusEnum";
import { RoleEnum } from "../enums/roleEnum";
import { InputReviewInterface, JwtPayload, ReviewInterface } from "../interfaces";
import { CourseRepository, ReviewRepository } from "../repositories";
import { AppError } from "../utils";
import { assertEnrolled } from "./accessControl";

// The author of the review or any admin
const canModerate = (user: JwtPayload, review: { userId: number }): boolean =>
  user.role === RoleEnum.admin || review.userId === user.userId;

export class ReviewServices {
  private reviewRepository = new ReviewRepository();
  private courseRepository = new CourseRepository();

  // Public: reviews of a published course plus the aggregate summary
  public async getCourseReviews(courseId: number): Promise<{
    reviews: ReviewInterface[];
    summary: { average: number; count: number };
  }> {
    const course = await this.courseRepository.findById(courseId);
    if (!course || course.status !== CourseStatusEnum.published) {
      throw new AppError(404, "Course not found");
    }

    const [reviews, summary] = await Promise.all([
      this.reviewRepository.findAllByCourse(courseId),
      this.reviewRepository.getCourseSummary(courseId),
    ]);

    return { reviews, summary };
  }

  // Enrolled student: one review per course, editable afterwards
  public async createReview(
    user: JwtPayload,
    courseId: number,
    data: { rating: number; comment?: string | null }
  ): Promise<ReviewInterface> {
    const course = await this.courseRepository.findById(courseId);
    if (!course) throw new AppError(404, "Course not found");
    if (course.status !== CourseStatusEnum.published) {
      throw new AppError(400, "You can only review published courses");
    }

    // enrollment is the credential for having an opinion worth storing
    await assertEnrolled(user.userId, courseId);

    if (await this.reviewRepository.findByUserAndCourse(user.userId, courseId)) {
      throw new AppError(409, "You have already reviewed this course — update your existing review instead");
    }

    const input: InputReviewInterface = {
      userId: user.userId,
      courseId,
      rating: data.rating,
      comment: data.comment ?? null,
    };
    return this.reviewRepository.create(input);
  }

  // Author or admin
  public async updateReview(
    user: JwtPayload,
    id: number,
    data: Partial<Pick<InputReviewInterface, "rating" | "comment">>
  ): Promise<void> {
    const review = await this.reviewRepository.findById(id);
    if (!review) throw new AppError(404, "Review not found");
    if (!canModerate(user, review)) throw new AppError(403, "You can only edit your own review");

    await this.reviewRepository.update(id, data);
  }

  public async deleteReview(user: JwtPayload, id: number): Promise<void> {
    const review = await this.reviewRepository.findById(id);
    if (!review) throw new AppError(404, "Review not found");
    if (!canModerate(user, review)) throw new AppError(403, "You can only delete your own review");

    await this.reviewRepository.delete(id);
  }
}
