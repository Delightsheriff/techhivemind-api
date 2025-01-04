import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import mongoose from "mongoose";
import { createError } from "../../common/utils/error";
import { Order } from "../../models/Order";
import { Product } from "../../models/Product";

// cancelOrder
export const cancelOrder = async (req: AuthRequest, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const orderId = req.params.id;
    const userId = req.user?._id;

    if (!userId) {
      throw createError(401, "Unauthorized, please sign in");
    }

    if (!orderId) {
      throw createError(400, "Order ID is required");
    }

    const order = await Order.findById(orderId).session(session);

    if (!order) {
      throw createError(404, "Order not found");
    }

    if (order.userId.toString() !== userId.toString()) {
      throw createError(403, "You are not authorized to cancel this order");
    }

    if (order.status !== "pending") {
      await session.abortTransaction();
      throw createError(
        400,
        "Order cannot be cancelled. Current status: " + order.status
      );
    }

    // Restore product stock
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product).session(session);
      if (product) {
        product.stock += item.quantity;
        await product.save({ session });
      }
    }
    order.status = "cancelled";
    await order.save({ session });

    await session.commitTransaction();
    res.status(200).json({ message: "Order cancelled successfully", order });
  } catch (error: any) {
    await session.abortTransaction();
    console.error("Error in cancelOrder:", error);
    res
      .status(error.status || 500)
      .json({ error: error.message || "Internal server error" });
  } finally {
    session.endSession();
  }
};
