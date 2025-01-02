import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import { createError } from "../../common/utils/error";
import { Cart } from "../../models/Cart";

// Get all cart items for a user
export const getAllCartItems = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      throw createError(401, "Unauthorized, please sign in");
    }

    const cart = await Cart.findOne({ user: userId }).populate(
      "cartItems.product"
    ); // Populate product details

    res
      .status(200)
      .json({ cart, message: "Cart items retrieved successfully" });
  } catch (error: any) {
    console.error("Error in getAllCartItems:", error);
    res.status(error.status || 500).json({
      error: error.message || "Internal server error",
    });
  }
};
