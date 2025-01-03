import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import { createError } from "../../common/utils/error";
import { Wishlist } from "../../models/Wishlist";

// Get all wishlist items for a user
export const getAllWishlistItems = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      throw createError(401, "Unauthorized, please sign in");
    }

    const wishlist = await Wishlist.findOne({ userId }).populate("products");

    if (!wishlist) {
      res.status(200).json({ message: "Wishlist is empty", wishlist: [] }); // return empty array if no wishlist
    }

    res
      .status(200)
      .json({ wishlist, message: "Wishlist items retrieved successfully" });
  } catch (error: any) {
    console.error("Error in getAllWishlistItems:", error);
    res.status(error.status || 500).json({
      error: error.message || "Internal server error",
    });
  }
};
