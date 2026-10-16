import { Transaction } from "sequelize";
import { OrderStatusEnum } from "../enums/orderStatusEnum";
import { InputOrderInterface, OrderInterface } from "../interfaces";
import Models from "../models";

export class OrderRepository {
  public async findAllByUser(userId: number): Promise<OrderInterface[]> {
    return Models.Orders.findAll({
      where: { userId },
      include: [{ model: Models.Courses, as: "course", attributes: ["id", "title", "slug", "price", "thumbnailUrl"] }],
      order: [["createdAt", "DESC"]],
    });
  }

  public async findAllByStatus(status: OrderStatusEnum): Promise<OrderInterface[]> {
    return Models.Orders.findAll({
      where: { status },
      include: [
        { model: Models.Users, as: "user", attributes: ["id", "name", "email"] },
        { model: Models.Courses, as: "course", attributes: ["id", "title", "slug"] },
      ],
      order: [["createdAt", "DESC"]],
    });
  }

  public async findById(id: number): Promise<OrderInterface | null> {
    return Models.Orders.findByPk(id);
  }

  public async findPendingByUserAndCourse(userId: number, courseId: number): Promise<OrderInterface | null> {
    return Models.Orders.findOne({
      where: { userId, courseId, status: OrderStatusEnum.pending },
      order: [["createdAt", "DESC"]],
    });
  }

  public async create(data: InputOrderInterface): Promise<OrderInterface> {
    return Models.Orders.create(data);
  }

  public async update(id: number, data: Partial<InputOrderInterface>, transaction?: Transaction): Promise<void> {
    await Models.Orders.update(data, { where: { id }, transaction });
  }
}
