import { NextFunction, Request, Response } from "express";
import { IUser } from "../common/interface/users";
import { createError } from "../common/utils/error";
import { verifyToken } from "../common/utils/token";
import { ENVIRONMENT } from "../common/config/environment";
import { User } from "../models/User";

export interface AuthRequest extends Request {
  user?: IUser;
  file?: Express.Multer.File; // Ensure this matches single-file uploads
  files?:
    | Express.Multer.File[]
    | { [fieldname: string]: Express.Multer.File[] };
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return next(createError(401, "No token provided"));
    }

    const token = authHeader.split(" ")[1];
    
    if (!token) {
      return next(createError(401, "Invalid authorization format"));
    }

    try {
      const decoded = verifyToken(token, ENVIRONMENT.JWT.ACCESS);
      const user = await User.findById(decoded._id).select("-password");

      if (!user) {
        return next(createError(404, "User not found"));
      }

      req.user = user.toObject();
      next();
    } catch (tokenError: any) {
      if (tokenError.name === "TokenExpiredError") {
        return next(createError(401, "Token has expired"));
      }
      if (tokenError.name === "JsonWebTokenError") {
        return next(createError(401, "Invalid token"));
      }
      return next(tokenError);
    }
  } catch (error: any) {
    return next(error);
  }
};