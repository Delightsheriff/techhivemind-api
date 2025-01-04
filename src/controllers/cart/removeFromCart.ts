import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import { createError } from "../../common/utils/error";
import { Cart } from "../../models/Cart";

// Remove item from cart
export const removeFromCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { productId } = req.body; // Get productId from params

    if (!userId) {
      throw createError(401, "Unauthorized, please sign in");
    }

    if (!productId) {
      throw createError(400, "Product ID is required");
    }

    const cart = await Cart.findOneAndUpdate(
      { userId },
      { $pull: { cartItems: { product: productId } } }, // Remove matching item
      { new: true }
    );

    if (!cart) {
      res.status(404).json({ message: "Cart not found" });
    }

    res.status(200).json({ message: "Item removed from cart", cart });
  } catch (error: any) {
    console.error("Error in removeFromCart:", error);
    res.status(error.status || 500).json({
      error: error.message || "Internal server error",
    });
  }
};
