import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import { createError } from "../../common/utils/error";
import { Cart } from "../../models/Cart";

// Get all cart items for a user
export const getAllCartItems = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      throw createError(401, "Unauthorized, please sign in");
    }

    const cart = await Cart.findOne({ userId }).populate("cartItems.product");

    // Correct handling of empty cart: Send response and RETURN
    if (!cart) {
      res.status(200).json({ message: "Cart is empty", cart: [] });
      return;
    }

    // If cart exists, send this response and RETURN
    res
      .status(200)
      .json({ cart, message: "Cart items retrieved successfully" });
    return;
  } catch (error: any) {
    console.error("Error in getAllCartItems:", error);
    res.status(error.status || 500).json({
      // Return here as well
      error: error.message || "Internal server error",
    });
    return;
  }
};
