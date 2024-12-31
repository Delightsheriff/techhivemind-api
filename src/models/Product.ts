import mongoose, { Schema } from "mongoose";
import { IProduct } from "../common/interface/products";

const productSchema = new Schema<IProduct>({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category:{
        type: String,
        enum:["computers", "tablets", "drones_&_cameras", "smartphones", "headphones", "speakers", "wearable_tech","tv_&home_cinema"],
    },
    stock: {
        type: Number,
        required: true
    },
    onsale: {
        type: Boolean,
        default: false
    },
    salePrice: {
        type: Number,
        default: 0
    },
    images: {
        type: [String],
        required: true
    },
    vendor: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
    

}, { timestamps: true });

export const Product = mongoose.model<IProduct>("Product", productSchema);