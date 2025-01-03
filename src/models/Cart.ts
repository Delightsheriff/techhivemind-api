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

// Virtual for calculated total
cartSchema.virtual("calculatedTotal").get(async function () {
  let total = 0;
  for (const item of this.cartItems) {
    const product = await mongoose.model("Product").findById(item.product);
    if (product) {
      total += product.price * item.quantity;
    }
  }
  return total;
});

// Pre-save hook to update total
cartSchema.pre("save", async function (next) {
  if (this.isModified("cartItems")) {
    this.total = await this.get("calculatedTotal");
  }
  next();
});

export const Cart = mongoose.model("Cart", cartSchema);
