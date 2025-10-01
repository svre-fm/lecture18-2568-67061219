import { type Request, type Response, type NextFunction } from "express";
import { type CustomRequest, type User } from "../libs/types.js";
import { users, reset_users } from "../db/db.js";

export const checkRoleStudent = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const payload = req.user;
  const token = req.token;
  const user = users.find((u: User) => u.username === payload?.username);
  if (!user || user.role !== "STUDENT") {
    return res.status(401).json({
      success: false,
      message: "Forbidden access",
    });
  }
  next();
};