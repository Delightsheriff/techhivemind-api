import { Response } from "express";
import { getCache, setCache } from "../../common/utils/caching";
import { createError } from "../../common/utils/error";
import { AuthRequest } from "../../middleware/auth";
import { User } from "../../models/User";


export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    // Check cache for user data
    let user = await getCache(`user:${userId}`);
    if (!user) {
      // Fetch from database if cache miss
      user = await User.findById(userId).lean();
      if (!user) {
        throw createError(404, "User not found");
      }

      // Sanitize user data and cache it again
      const sanitizedUser = { ...user, password: undefined };
      await setCache(`user:${userId}`, sanitizedUser, 3600); // Cache for 1 hour
      user = sanitizedUser;
    }

    res.status(200).json({ user });
  } catch (error: any) {
    res.status(error.status || 500).json({
      error: error.message || "Internal server error",
    });
  }
};
