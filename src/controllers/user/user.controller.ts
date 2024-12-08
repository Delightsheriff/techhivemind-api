import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import { createError } from "../../common/utils/error";
import { IUser } from "../../common/interface/users";
import { User } from "../../models/User";
import { getCache, deleteCache, setCache } from "../../common/utils/caching";

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { firstName, lastName } = req.body;

    if (!userId) {
      throw createError(401, "Unauthorized, sign in again");
    }

    // Attempt to get user data from cache
    const cachedUser = await getCache(`user:${userId}`);
    let user = cachedUser ? JSON.parse(cachedUser) : null;

    // Fetch from DB if not in cache
    if (!user) {
      user = await User.findById(userId);
      if (!user) {
        throw createError(404, "User not found");
      }
      // Cache the user object for future use
      await setCache(`user:${userId}`, user, 3600);
    }

    const updateData: Partial<IUser> = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;

    // Only proceed with update if there are fields to update
    if (Object.keys(updateData).length === 0) {
      throw createError(400, "No valid fields to update");
    }

    // Update user data in DB
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      throw createError(404, "User not found");
    }

    // Remove old cache and cache updated user
    await deleteCache(`user:${userId}`);
    await setCache(`user:${userId}`, updatedUser, 3600);

    res.status(200).json({
      message: "User updated successfully",
      data: { user: updatedUser },
    });
  } catch (error: any) {
    res.status(error.status || 500).json({
      error: error.message || "Internal server error",
    });
  }
};

export const updateProfilePicture = async (
  req: AuthRequest,
  res: Response,
) => {};

export const becomeVendor = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      throw createError(401, "Unauthorized, please sign in");
    }

    // Check Redis cache first
    const cachedUser = await getCache(`user:${userId}`);
    const user = cachedUser
      ? JSON.parse(cachedUser)
      : await User.findById(userId);

    if (!user) {
      throw createError(404, "User not found");
    }

    if (user.accountType === "vendor") {
      return res.status(400).json({ message: "You are already a vendor" });
    }

    if (user.accountType === "admin") {
      return res.status(403).json({ message: "Admins cannot become vendors" });
    }

    // Update accountType to "vendor" and set termsAccepted to true
    user.accountType = "vendor";
    user.termsAccepted = true;

    await User.findByIdAndUpdate(userId, user, {
      new: true,
      runValidators: true,
    });

    // Remove old cache and cache updated user
    await deleteCache(`user:${userId}`);
    await setCache(`user:${userId}`, user, 3600);

    res.status(200).json({
      message: "Congratulations! You are now a vendor.",
      data: { user },
    });
  } catch (error: any) {
    res.status(error.status || 500).json({
      error: error.message || "Internal server error",
    });
  }
};
