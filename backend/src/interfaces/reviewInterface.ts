import * as Sequelize from "sequelize";

export interface InputReviewInterface {
  userId: number;
  courseId: number;
  rating: number;
  comment?: string | null;
}

export interface ReviewInterface extends InputReviewInterface {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: Date;
}

export interface ReviewModelInterface
  extends Sequelize.Model<ReviewInterface, InputReviewInterface>,
    ReviewInterface {}
