import { Request, Response, NextFunction } from "express";
import { ENVIRONMENT } from "../../common/config/environment";
import { deleteCache, setCache } from "../../common/utils/caching";
import { createError } from "../../common/utils/error";
import { verifyToken, createfreshToken } from "../../common/utils/token";
import { User } from "../../models/User";

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(createError(401, "Refresh token is required"));
    }

    // Verify the refresh token using the REFRESH secret
    const decoded = verifyToken(refreshToken, ENVIRONMENT.JWT.REFRESH);

    const user = await User.findById(decoded._id);
    if (!user) {
      return next(createError(401, "User not found"));
    }

    // Check if the provided refresh token matches the one stored in the database
    if (user.refreshToken !== refreshToken) {
      return next(createError(403, "Invalid or expired refresh token"));
    }

    // Generate only a new access token
    const newAccessToken = createfreshToken(user);

    // Remove old cache
    await deleteCache(`user:${user._id}`);

    // Sanitize user data (exclude sensitive fields)
    const sanitizedUser = { ...user.toObject(), password: undefined };

    // Cache user data for future use
    await setCache(`user:${user._id}`, sanitizedUser, 3600); // Cache for 1 hour

    res.status(200).json({
      accessToken: newAccessToken,
      message: "Token refresh successful",
    });
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return next(createError(401, "Refresh token has expired"));
    }
    if (error.name === "JsonWebTokenError") {
      return next(createError(401, "Invalid refresh token"));
    }

    // Propagate other errors
    next(
      createError(error.status || 500, error.message || "Internal server error")
    );
  }
};
