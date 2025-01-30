import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import { createError } from "../../common/utils/error";
import { Order } from "../../models/Order";

export const deleteOrder = async (req: AuthRequest, res: Response) => {
  try {
    const orderId = req.params.id;
    const userId = req.user?._id;

    // Check if user is authenticated
    if (!userId) {
      throw createError(401, "Unauthorized, please sign in");
    }

    // Validate order ID
    if (!orderId) {
      throw createError(400, "Order ID is required");
    }

    // Find the order
    const order = await Order.findById(orderId);

    // Check if order exists
    if (!order) {
      throw createError(404, "Order not found");
    }

    // Verify user owns the order
    if (order.userId.toString() !== userId.toString()) {
      throw createError(403, "You are not authorized to delete this order");
    }

    // Delete the order
    await Order.findByIdAndDelete(orderId);

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error: any) {
    console.error("Error in deleteOrder:", error);
    res
      .status(error.status || 500)
      .json({ error: error.message || "Internal server error" });
  }
};
