import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import { User } from "../../models/User";
import { createError } from "../../common/utils/error";
import { Product } from "../../models/Product";

export const myProducts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    // Fetch the user's role from the database
    const user = await User.findById(userId).select("accountType");
    if (!user) {
      throw createError(404, "User not found");
    }

    if (user.accountType !== "vendor") {
      throw createError(403, "Unauthorized to view this resource");
    }
    // Pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    // Fetch the paginated products for the user
    const products = await Product.find({ vendor: userId })
      .skip(skip)
      .limit(limit);

    const totalProducts = await Product.countDocuments({ vendor: userId });
    const totalPages = Math.ceil(totalProducts / limit);

    res.status(200).json({
      products,
      totalPages,
      currentPage: page,
      totalProducts,
    });
  } catch (error: any) {
    console.error("Error in getProducts:", error);
    res.status(error.status || 500).json({
      error: error.message || "Internal server error",
    });
  }
};
