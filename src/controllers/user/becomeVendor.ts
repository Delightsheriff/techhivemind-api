import { Response } from "express";
import { sendWelcomeVendor } from "../../common/services/email.service";
import { getCache, setCache, deleteCache } from "../../common/utils/caching";
import { createError } from "../../common/utils/error";
import { AuthRequest } from "../../middleware/auth";
import { User } from "../../models/User";


export const becomeVendor = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { termsAccepted } = req.body;

    if (!userId) {
      throw createError(401, "Unauthorized, please sign in");
    }

    if (!termsAccepted) {
      throw createError(400, "You must accept the terms and conditions to become a vendor");

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
