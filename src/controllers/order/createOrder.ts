import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import mongoose from "mongoose";
import { createError } from "../../common/utils/error";
import { Cart } from "../../models/Cart";
import { Product } from "../../models/Product";
import { Order } from "../../models/Order";

export const createOrder = async (req: AuthRequest, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const userId = req.user?._id;
    const { cartId, shippingAddress } = req.body;

    if (!userId) {
      throw createError(401, "Unauthorized, please sign in");
    }
    if (!cartId) {
      throw createError(400, "Cart ID is required");
    }
    if (!shippingAddress) {
      throw createError(400, "Shipping address is required");
    }

    const cart = await Cart.findById(cartId)
      .populate("cartItems.product")
      .session(session);

    // Handle missing cart
    if (!cart) {
      await session.abortTransaction();
      res.status(404).json({ message: "Cart not found" });
      return;
    }

    if (cart.cartItems.length === 0) {
      await session.abortTransaction();
      res.status(400).json({ message: "Cart is empty" });
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const item of cart.cartItems) {
      const product = await Product.findById(item.product._id).session(session);

      // Handle missing product
      if (!product) {
        await session.abortTransaction();
        res
          .status(404)
          .json({ message: `Product with ID ${item.product._id} not found` });
        return; // Exit the function if product is not found
      }

      if (product.stock < item.quantity) {
        await session.abortTransaction();
        res.status(400).json({
          message: `Insufficient stock for product ${product.name}. Available: ${product.stock}`,
        });
        return; // Exit the function if insufficient stock
      }

      product.stock -= item.quantity;
      await product.save({ session });

      orderItems.push({
        product: item.product._id,
        quantity: item.quantity,
        price: product.price,
      });
      totalAmount += product.price * item.quantity;
    }

    const order = await Order.create(
      [
        {
          userId,
          orderItems,
          totalAmount,
          shippingAddress,
          status: "pending",
        },
      ],
      { session }
    );

    cart.cartItems.splice(0, cart.cartItems.length);
    cart.total = 0;
    await cart.save({ session });
    await session.commitTransaction();

    res.status(201).json({ message: "Order created successfully", order });
  } catch (error: any) {
    console.error("Error in createOrder:", error);
    res.status(error.status || 500).json({
      error: error.message || "Internal server error",
    });
  } finally {
    session.endSession();
  }
};
