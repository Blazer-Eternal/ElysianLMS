import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { jwtSecret } from "../config";
import { RoleEnum } from "../enums/roleEnum";
import { CustomRequestInterface } from "../interfaces";

export class Guard {
  // Verifies JWT and attaches decoded payload to req.user
  public static grantAccess(req: CustomRequestInterface, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ success: false, message: "Please provide a token with your request headers" });
    }

    try {
      const decoded = jwt.verify(token, jwtSecret);
      req.user = decoded as CustomRequestInterface["user"];
      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
  }

  // Attaches req.user when a valid token is present, but never rejects:
  // used by endpoints that serve both anonymous visitors (preview lessons)
  // and authenticated students (full content).
  public static optionalAuth(req: CustomRequestInterface, _res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return next();

    try {
      req.user = jwt.verify(token, jwtSecret) as CustomRequestInterface["user"];
    } catch {
      // an invalid token on an optional path just means "anonymous"
    }
    next();
  }

  // Checks that the authenticated user has one of the allowed roles
  public static grantRole(...roles: RoleEnum[]) {
    return (req: CustomRequestInterface, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({ success: false, message: "Authentication required" });
      }
      if (roles.includes(req.user.role as RoleEnum)) {
        next();
      } else {
        return res.status(403).json({ success: false, message: "You are not authorized to perform this task" });
      }
    };
  }
}