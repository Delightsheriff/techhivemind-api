import { Response } from "express";
import { IUser } from "../../common/interface/users";
import { getCache, setCache, deleteCache } from "../../common/utils/caching";
import { createError } from "../../common/utils/error";
import { AuthRequest } from "../../middleware/auth";
import { User } from "../../models/User";
import { undefined } from "./user.controller";


export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { firstName, lastName } = req.body;

    if (!userId) {
      throw createError(401, "Unauthorized, sign in again");
    }

    // Attempt to get user data from cache
    let user = await getCache(`user:${userId}`);


    // Fetch from DB if not in cache
    if (!user) {
      const dbUser = await User.findById(userId);
      if (!dbUser) {
        throw createError(404, "User not found");
      }
      // Cache the user object - setCache handles stringification
      await setCache(`user:${userId}`, dbUser.toJSON(), 3600);
      user = dbUser;
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
