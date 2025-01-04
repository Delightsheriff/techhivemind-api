import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import { createError } from "../../common/utils/error";
import { Wishlist } from "../../models/Wishlist";
import { Product } from "../../models/Product";

// Helper function to update and save the wishlist
async function updateAndSaveWishlist(
  wishlist: any,
  productId: any,
  res: Response
) {
  try {
    if (!wishlist.products.includes(productId)) {
      wishlist.products.push(productId);
      await wishlist.save();
      res
        .status(200)
        .json({ message: "Product added to wishlist", wishlist: wishlist._id });
    } else {
      res
        .status(200)
        .json({ message: "Product already in wishlist", wishlist });
    }
  } catch (saveError: any) {
    console.error("Error saving wishlist:", saveError);
    res.status(500).json({ error: "Failed to update wishlist" }); // More specific error
  }
}

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
      res.status(404).json({ error: "Product not found" }); // Return here
    }

    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = await Wishlist.create({ userId, products: [productId] });
      res
        .status(200)
        .json({ message: "Product added to wishlist", wishlist: wishlist._id });
    } else {
      updateAndSaveWishlist(wishlist, productId, res); // Use the helper function
    }
  } catch (error: any) {
    console.error("Error in addToWishlist:", error);
    res.status(error.status || 500).json({
      error: error.message || "Internal server error",
    });
  }
};
