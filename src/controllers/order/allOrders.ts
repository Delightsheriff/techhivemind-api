import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";

import { createError } from "../../common/utils/error";
import { Order } from "../../models/Order";

// getOrders
export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      throw createError(401, "Unauthorized, please sign in");
    }

    const orders = await Order.find({ userId }).populate("orderItems.product"); //Populate for product details

    if (!orders) {
      res.status(200).json({
        message: "No orders found ",
        orders: [],
      });
      return;
    }
    res.status(200).json({ orders, message: "Orders retrieved successfully" });
  } catch (error: any) {
    console.error("Error in getOrders:", error);
    res
      .status(error.status || 500)
      .json({ error: error.message || "Internal server error" });
  }
};
