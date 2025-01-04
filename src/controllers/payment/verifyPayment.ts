import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import { createError } from "../../common/utils/error";
import { PaymentService } from "../../common/services/payment.service";

export const verifyPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { reference } = req.query;
    if (!reference) {
      throw createError(400, "Payment Reference is required");
    }
    const paymentService = new PaymentService();
    const verificationResult = await paymentService.verifyPayment(
      reference as string
    );
    console.log(verificationResult);
    if (verificationResult.success) {
      // Payment successful
      res.status(200).json({
        message: "Payment verified successfully",
        verificationResult,
        // order: verificationResult.order,
      }); // Send success response with order data
    } else {
      // Payment failed
      res.status(400).json({
        error: verificationResult.message || "Payment verification failed",
      }); // Send error response
    }
  } catch (error: any) {
    console.error("Error in verifyPayment:", error);
    res.status(error.status || 500).json({
      error: error.message || "Internal server error",
    });
  }
};
