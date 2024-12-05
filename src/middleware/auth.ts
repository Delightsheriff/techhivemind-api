import { NextFunction, Request, Response } from "express";
import { IUser } from "../common/interface/users";
import { createError } from "../common/utils/error";
import { verifyToken } from "../common/utils/token";
import { ENVIRONMENT } from "../common/config/environment";
import { User } from "../models/User";

export interface AuthRequest extends Request {
  user?: IUser;
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  try {
    if (!authHeader?.startsWith("Bearer ")) {
      return next(createError(401, "No token provided"));
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token, ENVIRONMENT.JWT.ACCESS);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return next(createError(404, "User not found"));
    }

    req.user = user.toObject();
    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return next(createError(401, "Token has expired"));
    }
    if (error.name === "JsonWebTokenError") {
      return next(createError(401, "Invalid token"));
    }

    // Propagate other errors
    next(
      createError(
        error.status || 500,
        error.message || "Internal server error",
      ),
    );
  }
};
