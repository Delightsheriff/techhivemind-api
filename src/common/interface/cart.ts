import { Types } from "mongoose";

export interface IcartItem {
  product: Types.ObjectId;
  quantity: number;
}

export interface Icart {
  userId: Types.ObjectId;
  cartItems: IcartItem;
  total: number;
}
