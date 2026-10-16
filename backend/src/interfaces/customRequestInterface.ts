import { Request } from "express";

// Shape of the decoded JWT payload attached to every authenticated request.
export interface JwtPayload {
  userId: number;
  email: string;
  role: string;
}

export interface CustomRequestInterface extends Request {
  user: JwtPayload;
}