import { Response } from "express";
import { createError } from "../../common/utils/error";
import { Cart } from "../../models/Cart";
import { AuthRequest } from "../../middleware/auth";

// Update cart item quantity
export const updateCartItem = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!userId) {
      throw createError(401, "Unauthorized, please sign in");
    }

    if (!productId || !quantity) {
      throw createError(400, "Product ID and quantity are required");
    }

    if (quantity <= 0) {
      // Handle removal logic *within* this controller
      const cart = await Cart.findOneAndUpdate(
        { user: userId },
        { $pull: { cartItems: { product: productId } } },
        { new: true }
      );
      if (!cart) {
        res.status(404).json({ message: "Cart not found" });
      }
      res.status(200).json({ message: "Item removed from cart", cart });
    }

    const cart = await Cart.findOneAndUpdate(
      { user: userId, "cartItems.product": productId },
      { $set: { "cartItems.$.quantity": quantity } },
      { new: true }
    );

    if (!cart) {
      res.status(404).json({ message: "Cart or item not found" });
    }

    res.status(200).json({ message: "Cart item updated", cart });
  } catch (error: any) {
    console.error("Error in updateCartItem:", error);
    res.status(error.status || 500).json({
      error: error.message || "Internal server error",
    });
  }
};
