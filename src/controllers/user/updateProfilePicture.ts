import { Response } from "express";
import { createError } from "../../common/utils/error";
import { AuthRequest } from "../../middleware/auth";
import { uploadProfilePhoto } from "../../common/services/upload.service";
import { getCache, setCache } from "../../common/utils/caching";
import { User } from "../../models/User";


export const updateProfilePicture = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const photo = req.file;
    
    if (!userId) {
      throw createError(401, "Unauthorized, please sign in");
    }

    if (!photo) {
      throw createError(400, "No file uploaded");
    }
    // Attempt to get user data from cache
    let user = await getCache(`user:${userId}`);
    // // Fetch from DB if not in cache
    if (!user) {
      const dbUser = await User.findById(userId);
      if (!dbUser) {
        throw createError(404, "User not found");
      }
    //   // Cache the user object - setCache handles stringification
      await setCache(`user:${userId}`, dbUser.toJSON(), 3600);
      user = dbUser;
    }
    // // Upload the new image
    const uploadedImage = await uploadProfilePhoto(photo);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePicture: uploadedImage.secure_url },
      { new: true },
    );
    if (!updatedUser) {
      throw createError(500, "Failed to update profile picture");
    }

    // Update cache with the new user data
    await setCache(`user:${userId}`, updatedUser.toJSON(), 3600);
    res.status(200).json({
      message: "Profile picture updated successfully",
      data: { user: updatedUser },
    });
  } catch (error: any) {
    console.error('Error in updateProfilePicture:', error);
    res.status(error.status || 500).json({
      error: error.message || "Internal server error",
    });
  }
};
