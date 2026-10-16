import * as Sequelize from "sequelize";
import { Database } from "../config";
import { OrderStatusEnum } from "../enums/orderStatusEnum";
import { PaymentGatewayEnum } from "../enums/paymentGatewayEnum";
import { OrderModelInterface } from "../interfaces/orderInterface";

const sequelize = Database.sequelize;

const Orders = sequelize.define<OrderModelInterface>(
  "Orders",
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    courseId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    amount: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0.01 },
      // pg returns NUMERIC as a string; hand back a real number
      get(this: OrderModelInterface) {
        return Number(this.getDataValue("amount"));
      },
    },
    gateway: {
      type: Sequelize.ENUM(...Object.values(PaymentGatewayEnum)),
      allowNull: false,
    },
    status: {
      type: Sequelize.ENUM(...Object.values(OrderStatusEnum)),
      allowNull: false,
      defaultValue: OrderStatusEnum.pending,
    },
    transactionId: {
      type: Sequelize.STRING(100),
      allowNull: true,
    },
    gatewayResponse: {
      type: Sequelize.JSONB,
      allowNull: true,
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    paidAt: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    refundedAt: {
      type: Sequelize.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "orders",
    underscored: true,
    timestamps: true,
    updatedAt: false,
    indexes: [
      { name: "orders_status_created_at_idx", fields: ["status", "created_at"] },
      { name: "orders_course_id_idx", fields: ["course_id"] },
      { name: "orders_user_id_idx", fields: ["user_id"] },
    ],
  }
);

export default Orders;
