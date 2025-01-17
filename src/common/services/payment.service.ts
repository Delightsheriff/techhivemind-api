import { ENVIRONMENT } from "../config/environment";
import { Order } from "../../models/Order";

export class PaymentService {
  private readonly PAYSTACK_BASE_URL = ENVIRONMENT.PAYSTACK.URL;
  private readonly headers;

  constructor() {
    this.headers = {
      Authorization: `Bearer ${ENVIRONMENT.PAYSTACK.API_SECRET}`,
      "Content-Type": "application/json",
    };
  }

  async initializePayment(order: any, email: string) {
    try {
      const response = await fetch(
        `${this.PAYSTACK_BASE_URL}/transaction/initialize`,
        {
          method: "POST",
          headers: this.headers,
          body: JSON.stringify({
            email,
            amount: order.totalAmount * 100, // Convert to kobo
            callback_url: `${ENVIRONMENT.APP.CLIENT}/order/verify`,
            metadata: {
              orderId: order._id,
              userId: order.userId,
              email,
            },
            reference: `ORDER_${order._id}_${Date.now()}`,
          }),
        }
      );
      if (!response.ok) {
        const errorText = await response.text(); // Get error message from Paystack
        throw new Error(
          `Payment initialization failed: ${response.status} - ${response.statusText} - ${errorText}`
        );
      }

      const responseData = await response.json();
      console.log(responseData);

      return {
        authorization_url: responseData.data.authorization_url,
        reference: responseData.data.reference,
      };
    } catch (error: any) {
      throw new Error(error.message || "Payment initialization failed");
    }
  }

  async verifyPayment(reference: string) {
    try {
      const response = await fetch(
        `${this.PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
        {
          method: "GET",
          headers: this.headers,
        }
      );

      if (!response.ok) {
        throw new Error("Payment verification failed");
      }

      const responseData = await response.json();
      const { data } = responseData;
      const { orderId } = data.metadata;

      if (data.status === "success") {
        const order = await Order.findById(orderId).populate(
          "orderItems.product"
        );

        if (order) {
          order.status = "paid";
          order.paymentReference = reference;
          await order.save();

          return {
            success: true,
            message: "Payment verified successfully",
            ...data,
            order,
          };
        }
      }

      return { success: false, message: "Payment verification failed" };
    } catch (error: any) {
      throw new Error(error.message || "Payment verification failed");
    }
  }
}
