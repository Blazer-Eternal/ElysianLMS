import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";

export class Validator {
  private constructor() {}

  public static check = (schema: ZodType) => {
    return (req: Request, _res: Response, next: NextFunction) => {
      // throws ZodError on failure; on success the body is replaced with the
      // parsed data, so unknown fields (like a sneaky "role") are stripped
      req.body = schema.parse(req.body);
      next();
    };
  };
}