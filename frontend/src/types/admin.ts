/** Admin-only payloads (GET /user, GET /order?status=). */

import type { Role } from "@/types/auth";
import type { OrderStatus, PaymentGateway } from "@/types/course";

/** GET /user — attribute list is chosen server-side (no password). */
export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  avatarUrl: string | null;
  isBanned: boolean;
  createdAt: string;
}

/** GET /order?status= — includes buyer and course, for reconciliation. */
export interface AdminOrder {
  id: number;
  userId: number;
  courseId: number;
  amount: number;
  status: OrderStatus;
  gateway: PaymentGateway;
  transactionId: string | null;
  gatewayResponse: Record<string, unknown> | null;
  createdAt: string;
  paidAt: string | null;
  refundedAt: string | null;
  user: { id: number; name: string; email: string };
  course: { id: number; title: string; slug: string };
}