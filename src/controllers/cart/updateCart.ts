import { Response } from "express";
import { createError } from "../../common/utils/error";
import { Cart } from "../../models/Cart";
import { AuthRequest } from "../../middleware/auth";
import { calculateCartTotal } from "../../common/utils/cart";

// Update cart item quantity
export const updateCartItem = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?._id;

    const { quantity, productId } = req.body;

    if (!userId) {
      throw createError(401, "Unauthorized, please sign in");
    }

    if (!productId || !quantity) {
      throw createError(400, "Product ID and quantity are required");
    }

    // First, check if cart exists, if not create it
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, cartItems: [] });
    }

    if (quantity <= 0) {
      // Handle removal logic
      cart = await Cart.findOneAndUpdate(
        { userId },
        { $pull: { cartItems: { product: productId } } },
        { new: true }
      );

      res.status(200).json({ message: "Item removed from cart", cart });
      return;
    }

    // Check if product exists in cart
    const productExists = cart.cartItems.some(
      (item) => item.product.toString() === productId
    );

    let updatedCart;
    if (productExists) {
      // Update existing item
      updatedCart = await Cart.findOneAndUpdate(
        { userId, "cartItems.product": productId },
        { $set: { "cartItems.$.quantity": quantity } },
        { new: true }
      );
    } else {
      // Add new item
      updatedCart = await Cart.findOneAndUpdate(
        { userId },
        {
          $push: {
            cartItems: {
              product: productId,
              quantity,
            },
          },
        },
        { new: true, upsert: true }
      );
    }

    if (!updatedCart) {
      throw createError(500, "Failed to update cart");
    }
    updatedCart.total = await calculateCartTotal(updatedCart);
    await updatedCart.save();

    res
      .status(200)
      .json({ message: "Cart updated successfully", cart: updatedCart });
    return;
  } catch (error: any) {
    console.error("Error in updateCartItem:", error);
    res.status(error.status || 500).json({
      error: error.message || "Internal server error",
    });
    return;
  }
};
