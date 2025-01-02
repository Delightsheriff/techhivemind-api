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

const cartSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  cartItems: [cartItemSchema],
});

// Virtual for dynamic total calculation (recommended)
cartSchema.virtual("total").get(async function () {
  let total = 0;
  for (const item of this.cartItems) {
    const product = await mongoose.model("Product").findById(item.product);
    if (product) {
      total += product.price * item.quantity; // Assuming 'price' is in your Product schema
    }
  }
  return total;
});

export const Cart = mongoose.model("Cart", cartSchema);
