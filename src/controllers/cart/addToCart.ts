import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import { createError } from "../../common/utils/error";
import { Product } from "../../models/Product";
import { Cart } from "../../models/Cart";

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

    // Validate quantity (optional)
    if (quantity <= 0) {
      throw createError(400, "Invalid quantity, please enter a positive value");
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await Cart.create({ user: userId, cartItems: [] });
    }

    const existingItem = cart.cartItems.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.cartItems.push({ product: productId, quantity });
    }
    await cart.save();

    return res.status(200).json({ message: "Added to cart", cart: cart._id });
  } catch (error: any) {
    console.error("Error in addToCart:", error);
    res.status(error.status || 500).json({
      error: error.message || "Internal server error",
    });
  }
};
