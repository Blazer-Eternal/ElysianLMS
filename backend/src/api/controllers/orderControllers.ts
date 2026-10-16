import { Request, Response } from "express";
import { OrderStatusEnum } from "../../enums/orderStatusEnum";
import { CustomRequestInterface } from "../../interfaces";
import { OrderServices } from "../../services";
import { parseId } from "../../utils";

const orderServices = new OrderServices();

export class OrderController {
  static async getMyOrders(req: CustomRequestInterface, res: Response) {
    const orders = await orderServices.getMyOrders(req.user);
    return res.status(200).json({ success: true, data: orders });
  }

  static async getOrdersByStatus(req: Request, res: Response) {
    const orders = await orderServices.getOrdersByStatus(req.query.status as OrderStatusEnum);
    return res.status(200).json({ success: true, data: orders });
  }

  static async getOrder(req: CustomRequestInterface, res: Response) {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Invalid order id" });

    const order = await orderServices.getOrder(req.user, id);
    return res.status(200).json({ success: true, data: order });
  }

  static async createOrder(req: CustomRequestInterface, res: Response) {
    const { courseId, gateway } = req.body;
    const order = await orderServices.createOrder(req.user, courseId, gateway);
    return res.status(201).json({ success: true, message: "Order created — complete payment at the gateway", data: order });
  }

  // Until real eSewa/Khalti callbacks land, admins confirm payments manually
  static async confirmOrder(req: CustomRequestInterface, res: Response) {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Invalid order id" });

    const { order, enrollmentId } = await orderServices.confirmPayment(id, req.body);
    return res.status(200).json({
      success: true,
      message: "Payment confirmed, enrollment created",
      data: { order, enrollmentId },
    });
  }

  static async markOrderFailed(req: CustomRequestInterface, res: Response) {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Invalid order id" });

    const order = await orderServices.markFailed(id, req.body.gatewayResponse);
    return res.status(200).json({ success: true, message: "Order marked as failed", data: order });
  }

  static async refundOrder(req: CustomRequestInterface, res: Response) {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Invalid order id" });

    const { order, enrollmentRevoked } = await orderServices.refund(id, req.body.gatewayResponse);
    return res.status(200).json({
      success: true,
      message: "Order refunded",
      data: { order, enrollmentRevoked },
    });
  }
}
