import * as Sequelize from "sequelize";
import { OrderStatusEnum } from "../enums/orderStatusEnum";
import { PaymentGatewayEnum } from "../enums/paymentGatewayEnum";

export interface InputOrderInterface {
  userId: number;
  courseId: number;
  amount: number;
  gateway: PaymentGatewayEnum;
  status?: OrderStatusEnum;
  transactionId?: string | null;
  gatewayResponse?: Record<string, unknown> | null;
  paidAt?: Date | null;
  refundedAt?: Date | null;
}

export interface OrderInterface extends InputOrderInterface {
  id: number;
  status: OrderStatusEnum;
  transactionId: string | null;
  gatewayResponse: Record<string, unknown> | null;
  createdAt: Date;
  paidAt: Date | null;
  refundedAt: Date | null;
}

export interface OrderModelInterface
  extends Sequelize.Model<OrderInterface, InputOrderInterface>,
    OrderInterface {}
