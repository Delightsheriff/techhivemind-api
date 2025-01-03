import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import { createError } from "../../common/utils/error";
import { Order } from "../../models/Order";

// getOrder
export const getOrder = async (req: AuthRequest, res: Response) => {
  try {
    const orderId = req.params.id;
    const userId = req.user?._id;
    if (!userId) {
      throw createError(401, "Unauthorized, please sign in");
    }

    if (!orderId) {
      throw createError(400, "Order ID is required");
    }

    const order = await Order.findById(orderId).populate("orderItems.product");

    if (!order) {
      throw createError(404, "Order not found");
    }
    if (order.userId.toString() !== userId.toString()) {
      throw createError(403, "You are not authorized to view this order");
    }

    res.status(200).json({ order, message: "Order retrieved successfully" });
  } catch (error: any) {
    console.error("Error in getOrder:", error);
    res
      .status(error.status || 500)
      .json({ error: error.message || "Internal server error" });
  }
};
