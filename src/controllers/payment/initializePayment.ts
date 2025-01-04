import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import { Order } from "../../models/Order";
import { createError } from "../../common/utils/error";
import { PaymentService } from "../../common/services/payment.service";

export const initializePayment = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId, email } = req.body;

    if (!orderId || !email) {
      throw createError(400, "Order ID and email are required");
    }

    const order = await Order.findById(orderId);
    if (!order) {
      throw createError(404, "Order not found");
    }

    if (order.status !== "pending") {
      throw createError(400, "Cannot process payment for non-pending order");
    }

    const paymentService = new PaymentService();
    const paymentData = await paymentService.initializePayment(order, email);
    console.log(paymentData);

    res.status(200).json({
      authorization_url: paymentData.authorization_url,
      reference: paymentData.reference,
    });
  } catch (error: any) {
    console.error("Error in initiliazePayment:", error);
    res.status(error.status || 500).json({
      error: error.message || "Internal server error",
    });
  }
};
