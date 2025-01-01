import { Request, Response } from "express";
import { createError } from "../../common/utils/error";
import { Product } from "../../models/Product";

export const getSingleProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw createError(400, "Product ID is required");
    }

    const product = await Product.findById(id);

    if (!product) {
      throw createError(404, "Product not found");
    }

    res.status(200).json({ success: true, data: { product } });
  } catch (error: any) {
    console.error("Error in getProducts:", error);
    res.status(error.status || 500).json({
      error: error.message || "Internal server error",
    });
  }
};
