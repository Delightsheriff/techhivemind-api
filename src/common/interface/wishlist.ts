import { Types } from "mongoose";

export interface Iwishlist {
  userId: Types.ObjectId;
  products: Types.ObjectId[];
}
