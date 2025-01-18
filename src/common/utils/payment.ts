// helpers/payment.helper.ts
interface ReceiptProduct {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  images: string[];
}

interface ReceiptResponse {
  receiptDetails: {
    orderId: string;
    orderDate: string;
    paymentDate: string;
    paymentReference: string;
    paymentMethod: string;
    cardType?: string;
    last4?: string;
  };
  customerDetails: {
    email: string;
    shippingAddress: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  };
  products: ReceiptProduct[];
  paymentSummary: {
    subtotal: number;
    processingFee: number;
    total: number;
    currency: string;
  };
}

export const formatReceiptData = (verificationResult: any): ReceiptResponse => {
  const { order, currency, fees, paid_at, reference, authorization } =
    verificationResult;
  const convertedfee = fees / 100;
  const products: ReceiptProduct[] = order.orderItems.map((item: any) => ({
    name: item.product.name,
    quantity: item.quantity,
    unitPrice: item.price,
    totalPrice: item.price * item.quantity,
    images: item.product.images,
  }));

  return {
    receiptDetails: {
      orderId: order._id,
      orderDate: order.createdAt,
      paymentDate: paid_at,
      paymentReference: reference,
      paymentMethod: authorization.channel,
      ...(authorization.channel === "card" && {
        cardType: authorization.card_type,
        last4: authorization.last4,
      }),
    },
    customerDetails: {
      email: verificationResult.customer.email,
      shippingAddress: order.shippingAddress,
    },
    products,
    paymentSummary: {
      subtotal: order.totalAmount,
      processingFee: convertedfee,
      total: order.totalAmount + convertedfee,
      currency,
    },
  };
};
