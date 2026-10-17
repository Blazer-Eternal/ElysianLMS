import type { CourseStatus, OrderStatus } from "@/types/course";

/** One tone map per domain; badges everywhere read from here. */
export const COURSE_STATUS_TONE: Record<
  CourseStatus,
  "positive" | "attention" | "negative" | "neutral"
> = {
  published: "positive",
  pending: "attention",
  rejected: "negative",
  draft: "neutral",
  archived: "neutral",
};

export const ORDER_STATUS_TONE: Record<
  OrderStatus,
  "positive" | "attention" | "negative" | "neutral"
> = {
  paid: "positive",
  pending: "attention",
  failed: "negative",
  refunded: "neutral",
};

/** Plain-language explanations used wherever a status appears. */
export const COURSE_STATUS_HINT: Record<CourseStatus, string> = {
  draft: "A work in progress. Nobody else can see it.",
  pending: "Submitted for review. An admin approves or rejects it.",
  published: "Live in the catalog and open for enrollment.",
  rejected: "Sent back by a reviewer. Fix it and resubmit.",
  archived: "Taken off the catalog. Existing students keep access.",
};
