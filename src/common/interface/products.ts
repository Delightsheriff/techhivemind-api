import { Types } from "mongoose";

export interface IProduct{
    name: string;
    price: number;
    description: string;
    category: string;
    stock: number;
    onsale: boolean;
    salePrice: number;
    images: string[];
    vendor: Types.ObjectId; // Reference to the vendor
}