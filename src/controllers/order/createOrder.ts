import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import mongoose from "mongoose";
import { createError } from "../../common/utils/error";
import { Cart } from "../../models/Cart";
import { Product } from "../../models/Product";
import { Order } from "../../models/Order";
import { calculateCartTotal } from "../../common/utils/cart";

export const createOrder = async (req: AuthRequest, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const userId = req.user?._id;
    const { cartId, shippingAddress } = req.body;

    if (!userId) throw createError(401, "Unauthorized, please sign in");
    if (!cartId) throw createError(400, "Cart ID is required");
    if (!shippingAddress)
      throw createError(400, "Shipping address is required");

    // Fetch cart with populated product details
    const cart = await Cart.findById(cartId)
      .populate("cartItems.product")
      .session(session);
    if (!cart) throw createError(404, "Cart not found");
    if (cart.cartItems.length === 0) throw createError(400, "Cart is empty");
    if (cart.userId.toString() !== userId.toString()) {
      throw createError(403, "Unauthorized access to cart");
    }

    const orderItems = [];
    const productsToUpdate = [];

    // Validate stock and prepare updates
    for (const item of cart.cartItems) {
      const product = await Product.findById(item.product._id).session(session);
      if (!product) {
        throw createError(404, `Product ${item.product._id} not found`);
      }

      if (product.stock < item.quantity) {
        throw createError(
          400,
          `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
        );
      }

      orderItems.push({
        product: item.product._id,
        quantity: item.quantity,
        price: product.price,
      });

      // Update product stock directly
      product.stock -= item.quantity;
      productsToUpdate.push(product.save({ session }));
    }

    // Calculate total using the helper function
    const totalAmount = await calculateCartTotal(cart);

    // Create order
    const [order] = await Order.create(
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

    // Wait for all product updates to complete
    await Promise.all(productsToUpdate);

    // Clear cart
    await Cart.findByIdAndUpdate(
      cartId,
      { $set: { cartItems: [], total: 0 } },
      { session }
    );

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: {
        orderId: order._id,
        totalAmount,
        status: order.status,
      },
    });
  } catch (error: any) {
    console.error("Error in createOrder:", error);
    res.status(error.status || 500).json({
      error: error.message || "Internal server error",
    });
  } finally {
    session.endSession();
  }
};
