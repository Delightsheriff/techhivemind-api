import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import { createError } from "../../common/utils/error";
import { PaymentService } from "../../common/services/payment.service";
import { formatReceiptData } from "../../common/utils/payment";

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
    if (verificationResult.success) {
      const receiptData = formatReceiptData(verificationResult);

      res.status(200).json({
        message: "Payment verified successfully",
        receipt: receiptData,
      });
    } else {
      res.status(400).json({
        error: verificationResult.message || "Payment verification failed",
      });
    }
  } catch (error: any) {
    console.error("Error in verifyPayment:", error);
    res.status(error.status || 500).json({
      error: error.message || "Internal server error",
    });
  }
};
