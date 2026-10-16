import { Database } from "../config";
import { CourseStatusEnum } from "../enums/courseStatusEnum";
import { OrderStatusEnum } from "../enums/orderStatusEnum";
import { PaymentGatewayEnum } from "../enums/paymentGatewayEnum";
import { JwtPayload, OrderInterface } from "../interfaces";
import { CourseRepository, EnrollmentRepository, OrderRepository } from "../repositories";
import { AppError } from "../utils";

// Paid-course purchase flow:
//   1. POST /orders           -> pending order (amount snapshotted from course price)
//   2. client pays at gateway -> gateway calls back (until real eSewa/Khalti
//                                integration lands, an admin confirms manually)
//   3. confirm()              -> pending -> paid, enrollment created atomically
// Refunds run through refund(): paid -> refunded, enrollment revoked.
// A failed order is terminal; the client starts a fresh order.
export class OrderServices {
  private orderRepository = new OrderRepository();
  private courseRepository = new CourseRepository();
  private enrollmentRepository = new EnrollmentRepository();

  public async getMyOrders(user: JwtPayload): Promise<OrderInterface[]> {
    return this.orderRepository.findAllByUser(user.userId);
  }

  public async getOrder(user: JwtPayload, id: number): Promise<OrderInterface> {
    const order = await this.orderRepository.findById(id);
    if (!order) throw new AppError(404, "Order not found");
    if (order.userId !== user.userId) throw new AppError(403, "This order belongs to another user");
    return order;
  }

  // Admin: list orders by lifecycle state, e.g. a payout reconciliation queue
  public async getOrdersByStatus(status: OrderStatusEnum): Promise<OrderInterface[]> {
    return this.orderRepository.findAllByStatus(status);
  }

  // Student: start a purchase. Reuses a still-pending order so double-clicks
  // don't litter the table, and refuses if already enrolled/paid.
  public async createOrder(user: JwtPayload, courseId: number, gateway: PaymentGatewayEnum): Promise<OrderInterface> {
    const course = await this.courseRepository.findById(courseId);
    if (!course) throw new AppError(404, "Course not found");
    if (course.status !== CourseStatusEnum.published) {
      throw new AppError(400, "This course is not open for enrollment");
    }
    if (course.price <= 0) {
      throw new AppError(400, "This course is free — use the enroll endpoint instead");
    }
    if (await this.enrollmentRepository.findByUserAndCourse(user.userId, courseId)) {
      throw new AppError(409, "You are already enrolled in this course");
    }

    const pending = await this.orderRepository.findPendingByUserAndCourse(user.userId, courseId);
    if (pending) {
      // gateway mismatch on the reuse: replace it so the client pays as requested
      if (pending.gateway !== gateway) {
        await this.orderRepository.update(pending.id, { gateway });
        return (await this.orderRepository.findById(pending.id))!;
      }
      return pending;
    }

    // amount is snapshotted: a later price change never rewrites history
    return this.orderRepository.create({
      userId: user.userId,
      courseId,
      amount: course.price,
      gateway,
      status: OrderStatusEnum.pending,
    });
  }

  // Admin: mark a pending order paid. Enrollment is created in the SAME
  // transaction — money without access (or access without money) cannot happen.
  public async confirmPayment(
    id: number,
    result: { transactionId?: string; gatewayResponse?: Record<string, unknown> }
  ): Promise<{ order: OrderInterface; enrollmentId: number }> {
    return Database.sequelize.transaction(async (t) => {
      const order = await this.orderRepository.findById(id);
      if (!order) throw new AppError(404, "Order not found");
      if (order.status !== OrderStatusEnum.pending) {
        throw new AppError(409, `Only pending orders can be confirmed (this one is '${order.status}')`);
      }

      // partial unique index (user_id, course_id) WHERE status='paid' is the
      // final referee if two confirmations race
      const enrollment = await this.enrollmentRepository.create(
        { userId: order.userId, courseId: order.courseId, orderId: order.id },
        t
      );

      await this.orderRepository.update(
        order.id,
        {
          status: OrderStatusEnum.paid,
          paidAt: new Date(),
          transactionId: result.transactionId ?? order.transactionId,
          gatewayResponse: result.gatewayResponse ?? order.gatewayResponse,
        },
        t
      );

      return { order: (await this.orderRepository.findById(order.id))!, enrollmentId: enrollment.id };
    });
  }

  // Admin: pending -> failed (e.g. gateway reported a declined payment)
  public async markFailed(id: number, gatewayResponse?: Record<string, unknown>): Promise<OrderInterface> {
    const order = await this.orderRepository.findById(id);
    if (!order) throw new AppError(404, "Order not found");
    if (order.status !== OrderStatusEnum.pending) {
      throw new AppError(409, `Only pending orders can fail (this one is '${order.status}')`);
    }

    await this.orderRepository.update(order.id, { status: OrderStatusEnum.failed, gatewayResponse });
    return (await this.orderRepository.findById(order.id))!;
  }

  // Admin: paid -> refunded, enrollment revoked in the same transaction.
  // Progress/attempts are kept: if the student re-purchases, history returns.
  public async refund(
    id: number,
    gatewayResponse?: Record<string, unknown>
  ): Promise<{ order: OrderInterface; enrollmentRevoked: boolean }> {
    return Database.sequelize.transaction(async (t) => {
      const order = await this.orderRepository.findById(id);
      if (!order) throw new AppError(404, "Order not found");
      if (order.status !== OrderStatusEnum.paid) {
        throw new AppError(409, `Only paid orders can be refunded (this one is '${order.status}')`);
      }

      const enrollment = await this.enrollmentRepository.findByUserAndCourse(order.userId, order.courseId);
      const enrollmentRevoked = enrollment ? await this.enrollmentRepository.delete(enrollment.id, t) : false;

      await this.orderRepository.update(
        order.id,
        { status: OrderStatusEnum.refunded, refundedAt: new Date(), gatewayResponse },
        t
      );

      return { order: (await this.orderRepository.findById(order.id))!, enrollmentRevoked };
    });
  }
}
