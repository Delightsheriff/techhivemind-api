import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import { createError } from "../../common/utils/error";
import { Cart } from "../../models/Cart";

export const clearCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      throw createError(401, "Unauthorized, please sign in");
    }

    const cart = await Cart.findOneAndUpdate(
      { userId },
      { $set: { cartItems: [] } }, // Clear all items
      { new: true }
    );

    if (!cart) {
      res.status(404).json({ message: "Cart not found" });
    }

    res.status(200).json({ message: "Cart cleared", cart });
  } catch (error: any) {
    console.error("Error in clearCart:", error);
    res.status(error.status || 500).json({
      error: error.message || "Internal server error",
    });
  }
};
