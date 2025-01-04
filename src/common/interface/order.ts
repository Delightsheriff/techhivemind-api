import { Types } from "mongoose";

export interface IOrderItem {
  product: Types.ObjectId;
  quantity: number;
  price: number;
}

export interface IOrder {
  orderItems: IOrderItem[];
  totalAmount: number;
  userId: Types.ObjectId;
  status: string;
  paymentReference: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}
