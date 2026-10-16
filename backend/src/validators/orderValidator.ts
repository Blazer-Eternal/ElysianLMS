import { z } from "zod";
import { OrderStatusEnum } from "../enums/orderStatusEnum";
import { PaymentGatewayEnum } from "../enums/paymentGatewayEnum";

export const createOrderValidator = z.object({
  courseId: z.number().int().positive(),
  gateway: z.enum(PaymentGatewayEnum),
});

export const confirmOrderValidator = z.object({
  transactionId: z.string().trim().min(1).max(100).optional(),
  gatewayResponse: z.record(z.string(), z.unknown()).optional(),
});

export const markOrderFailedValidator = z.object({
  gatewayResponse: z.record(z.string(), z.unknown()).optional(),
});

export const refundOrderValidator = z.object({
  gatewayResponse: z.record(z.string(), z.unknown()).optional(),
});

export const orderStatusQueryValidator = z.object({
  status: z.enum(OrderStatusEnum),
});
