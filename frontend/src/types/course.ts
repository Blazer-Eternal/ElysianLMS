/** Mirrors of course, catalog, review, enrollment and order payloads. */

export type CourseStatus = "draft" | "pending" | "published" | "rejected" | "archived";
export type OrderStatus = "pending" | "paid" | "failed" | "refunded";
export type PaymentGateway = "esewa" | "khalti";

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface CourseTeacher {
  id: number;
  name: string;
  avatarUrl: string | null;
}

/** Shape returned by GET /course and GET /course/:id (includes attached). */
export interface Course {
  id: number;
  teacherId: number;
  categoryId: number | null;
  title: string;
  slug: string;
  description: string;
  price: number;
  thumbnailUrl: string | null;
  status: CourseStatus;
  createdAt: string;
  updatedAt: string;
  category?: Category | null;
  teacher?: CourseTeacher | null;
}

/**
 * GET /course keeps pagination as a TOP-LEVEL sibling of `data`, so the
 * catalog query reads the whole envelope instead of unwrapping it.
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Review {
  id: number;
  userId: number;
  courseId: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { id: number; name: string; avatarUrl: string | null };
}

/** Also a top-level sibling: `{ data: Review[], summary: {...} }`. */
export interface ReviewSummary {
  average: number;
  count: number;
}

export interface MyEnrollment {
  id: number;
  userId: number;
  courseId: number;
  orderId: number | null;
  enrolledAt: string;
  course: {
    id: number;
    title: string;
    slug: string;
    thumbnailUrl: string | null;
    price: number;
    status: CourseStatus;
  };
}

export interface MyOrder {
  id: number;
  userId: number;
  courseId: number;
  amount: number;
  gateway: PaymentGateway;
  status: OrderStatus;
  transactionId: string | null;
  gatewayResponse: Record<string, unknown> | null;
  createdAt: string;
  paidAt: string | null;
  refundedAt: string | null;
  course: {
    id: number;
    title: string;
    slug: string;
    price: number;
    thumbnailUrl: string | null;
  };
}
