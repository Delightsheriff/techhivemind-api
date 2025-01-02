import mongoose, { Schema } from "mongoose";
import { Iwishlist } from "../common/interface/wishlist";

const wishlistSchema = new Schema<Iwishlist>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  products: [
    {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
});

export const Wishlist = mongoose.model("Wishlist", wishlistSchema);
