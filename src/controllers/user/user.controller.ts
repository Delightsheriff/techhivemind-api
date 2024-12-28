import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import { createError } from "../../common/utils/error";
import { IUser } from "../../common/interface/users";
import { User } from "../../models/User";
import { getCache, deleteCache, setCache } from "../../common/utils/caching";
import { sendWelcomeVendor } from "../../common/services/email.service";

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

export const becomeVendor = async (req: AuthRequest, res: Response)  =>{
  try {
    const userId = req.user?._id;
    const { termsAccepted } = req.body;

    if (!userId) {
      throw createError(401, "Unauthorized, please sign in");
    }

    if (!termsAccepted) {
      throw createError(400, "You must accept the terms and conditions to become a vendor");
    
    }

    // Retrieve user from cache or database
    const cachedUser = await getCache(`user:${userId}`);
    const user = cachedUser
      ? JSON.parse(cachedUser)
      : await User.findById(userId);

    if (!user) {
      throw createError(404, "User not found");
    }

    if (user.accountType === "vendor") {
      throw createError(400, "You are already a vendor");
      
    }

    if (user.accountType === "admin") {
      throw createError(403, "Admins cannot become vendors");
   
    }

    // Prepare update object
    const updates = { accountType: "vendor", termsAccepted: true };

    // Update user in database
    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      throw createError(500, "Failed to update user");
    }

    // Update cache
    await deleteCache(`user:${userId}`);
    await setCache(`user:${userId}`, JSON.stringify(updatedUser), 3600);

    // Send welcome email
    await sendWelcomeVendor(updatedUser.email, updatedUser.firstName);

    // Respond with success
    res.status(200).json({
      message: "Congratulations! You are now a vendor.",
      data: { user: updatedUser },
    });
  } catch (error: any) {
    console.error("Error in becomeVendor:", error);
    res.status(error.status || 500).json({
      error: error.message || "Internal server error",
    });
  }
};

