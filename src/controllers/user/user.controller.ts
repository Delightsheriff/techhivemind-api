import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import { createError } from "../../common/utils/error";
import { IUser } from "../../common/interface/users";
import { User } from "../../models/User";
import { deleteCache, setCache } from "../../common/utils/caching";

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { firstName, lastName } = req.body;

    if (!userId) {
      throw createError(401, "Unauthorized, sign in again");
    }

    const updateData: Partial<IUser> = {};

    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;

    // Only proceed with update if there are fields to update
    if (Object.keys(updateData).length === 0) {
      throw createError(400, "No valid fields to update");
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      throw createError(404, "User not found");
    }

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
