import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import { createError } from "../../common/utils/error";
import { Wishlist } from "../../models/Wishlist";

// Remove product from wishlist
export const removeFromWishlist = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { productId } = req.params;

    if (!userId) {
      throw createError(401, "Unauthorized, please sign in");
    }

    if (!productId) {
      throw createError(400, "Product ID is required");
    }

    const wishlist = await Wishlist.findOneAndUpdate(
      { userId },
      { $pull: { products: productId } },
      { new: true }
    );

    if (!wishlist) {
      res.status(404).json({ message: "Wishlist not found" });
    }

    res
      .status(200)
      .json({ message: "Product removed from wishlist", wishlist });
  } catch (error: any) {
    console.error("Error in removeFromWishlist:", error);
    res.status(error.status || 500).json({
      error: error.message || "Internal server error",
    });
  }
};
