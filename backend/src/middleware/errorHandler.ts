import { NextFunction, Request, Response } from "express";
import { ForeignKeyConstraintError, UniqueConstraintError } from "sequelize";
import { ZodError } from "zod";
import { AppError } from "../utils";

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: err.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
    });
  }

  if (err instanceof UniqueConstraintError) {
    return res.status(409).json({
      success: false,
      message: "A record with this value already exists",
      fields: Object.keys(err.fields ?? {}),
    });
  }

  if (err instanceof ForeignKeyConstraintError) {
    return res.status(409).json({
      success: false,
      message: "Related record is missing, or this record is still in use by others",
    });
  }

  console.error(err);
  return res.status(500).json({ success: false, message: "Internal server error" });
};