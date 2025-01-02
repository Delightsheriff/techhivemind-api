import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import { createError } from "../../common/utils/error";
import { Wishlist } from "../../models/Wishlist";
import { Product } from "../../models/Product";

// Add product to wishlist
export const addToWishlist = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { productId } = req.body;

    if (!userId) {
      throw createError(401, "Unauthorized, please sign in");
    }

    if (!productId) {
      throw createError(400, "Product ID is required");
    }

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({ error: "Product not found" });
    }

    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = await Wishlist.create({ userId, products: [productId] });
    } else {
      // Check if product is already in the wishlist
      if (!wishlist.products.includes(productId)) {
        wishlist.products.push(productId);
        await wishlist.save();
      }
    }

    res.status(200).json({ message: "Product added to wishlist", wishlist });
  } catch (error: any) {
    console.error("Error in addToWishlist:", error);
    res.status(error.status || 500).json({
      error: error.message || "Internal server error",
    });
  }
};
