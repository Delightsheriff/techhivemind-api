import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import { createError } from "../../common/utils/error";
import { Product } from "../../models/Product";
import { Cart } from "../../models/Cart";
import { calculateCartTotal } from "../../common/utils/cart";

export const addToCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { productId, quantity = 1 } = req.body;

    if (!userId) {
      throw createError(401, "Unauthorized, please sign in");
    }

    if (!productId) {
      throw createError(400, "Product ID is required");
    }

    if (quantity <= 0) {
      throw createError(400, "Invalid quantity, please enter a positive value");
    }

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({ error: "Product not found" });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = await Cart.create({ userId, cartItems: [], total: 0 });
    }

    const existingItemIndex = cart.cartItems.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex !== -1) {
      cart.cartItems[existingItemIndex].quantity += quantity;
    } else {
      cart.cartItems.push({ product: productId, quantity });
    }
    cart.total = await calculateCartTotal(cart);
    await cart.save();
    res.status(200).json({ message: "Added to cart", cart: cart._id }); // Early return here too
  } catch (error: any) {
    console.error("Error in addToCart:", error);
    res.status(error.status || 500).json({
      // Return here to prevent double sending
      error: error.message || "Internal server error",
    });
  }
};
