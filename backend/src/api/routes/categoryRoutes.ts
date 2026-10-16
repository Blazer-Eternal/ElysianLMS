import { Router } from "express";
import { CategoryController } from "../controllers/categoryControllers";
import { exceptionHandler, Guard, Validator } from "../../middleware";
import { createCategoryValidator, updateCategoryValidator } from "../../validators";
import { RoleEnum } from "../../enums/roleEnum";

const categoryRoutes = Router();

// Public
categoryRoutes.get("/", exceptionHandler(CategoryController.getAllCategories));
categoryRoutes.get("/:id", exceptionHandler(CategoryController.getCategoryById));

// Admin
categoryRoutes.post(
  "/",
  exceptionHandler(Guard.grantAccess),
  exceptionHandler(Guard.grantRole(RoleEnum.admin)),
  exceptionHandler(Validator.check(createCategoryValidator)),
  exceptionHandler(CategoryController.createCategory)
);

categoryRoutes.patch(
  "/:id",
  exceptionHandler(Guard.grantAccess),
  exceptionHandler(Guard.grantRole(RoleEnum.admin)),
  exceptionHandler(Validator.check(updateCategoryValidator)),
  exceptionHandler(CategoryController.updateCategory)
);

categoryRoutes.delete(
  "/:id",
  exceptionHandler(Guard.grantAccess),
  exceptionHandler(Guard.grantRole(RoleEnum.admin)),
  exceptionHandler(CategoryController.deleteCategory)
);

export default categoryRoutes;