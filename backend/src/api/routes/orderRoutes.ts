import { Router } from "express";
import { OrderController } from "../controllers/orderControllers";
import { exceptionHandler, Guard, Validator } from "../../middleware";
import { RoleEnum } from "../../enums/roleEnum";
import { createOrderValidator, confirmOrderValidator, markOrderFailedValidator, refundOrderValidator } from "../../validators";

const orderRoutes = Router();

// Student: my orders
orderRoutes.get(
  "/order/mine",
  exceptionHandler(Guard.grantAccess),
  exceptionHandler(OrderController.getMyOrders)
);

// Admin: reconciliation queue by status
orderRoutes.get(
  "/order",
  exceptionHandler(Guard.grantAccess),
  exceptionHandler(Guard.grantRole(RoleEnum.admin)),
  exceptionHandler(OrderController.getOrdersByStatus)
);

// Any authenticated user sees only their own order (checked in service)
orderRoutes.get(
  "/order/:id",
  exceptionHandler(Guard.grantAccess),
  exceptionHandler(OrderController.getOrder)
);

orderRoutes.post(
  "/order",
  exceptionHandler(Guard.grantAccess),
  exceptionHandler(Validator.check(createOrderValidator)),
  exceptionHandler(OrderController.createOrder)
);

// Admin: until eSewa/Khalti webhooks exist, payments are confirmed manually.
// These three are the money buttons — admin only, no exceptions.
orderRoutes.patch(
  "/order/:id/confirm",
  exceptionHandler(Guard.grantAccess),
  exceptionHandler(Guard.grantRole(RoleEnum.admin)),
  exceptionHandler(Validator.check(confirmOrderValidator)),
  exceptionHandler(OrderController.confirmOrder)
);

orderRoutes.patch(
  "/order/:id/fail",
  exceptionHandler(Guard.grantAccess),
  exceptionHandler(Guard.grantRole(RoleEnum.admin)),
  exceptionHandler(Validator.check(markOrderFailedValidator)),
  exceptionHandler(OrderController.markOrderFailed)
);

orderRoutes.patch(
  "/order/:id/refund",
  exceptionHandler(Guard.grantAccess),
  exceptionHandler(Guard.grantRole(RoleEnum.admin)),
  exceptionHandler(Validator.check(refundOrderValidator)),
  exceptionHandler(OrderController.refundOrder)
);

export default orderRoutes;
