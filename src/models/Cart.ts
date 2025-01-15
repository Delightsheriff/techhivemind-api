import mongoose, { Schema } from "mongoose";
import { IcartItem } from "../common/interface/cart";

const cartItemSchema = new Schema<IcartItem>({
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
});

const cartSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cartItems: [cartItemSchema],
    total: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Cart = mongoose.model("Cart", cartSchema);
