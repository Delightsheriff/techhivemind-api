import { Request, Response } from "express";
import {
  getBestSellers,
  getOnSaleFilter,
  validateCategory,
  validatePagination,
} from "../../common/utils/products";
import { createError } from "../../common/utils/error";
import { Product } from "../../models/Product";
import { getCache, setCache } from "../../common/utils/caching";

// Define a type for the filter object
type ProductFilter = {
  category?: string;
  onSale?: boolean;
};

export const getProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { category, page = 1, limit = 12 } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);

    // Validate pagination parameters
    const { error: paginationError, value } = validatePagination(
      pageNumber,
      limitNumber
    );
    if (paginationError) {
      throw createError(400, "Invalid pagination parameters");
    }

    const { page: validatedPage, limit: validatedLimit } = value;

    // Handle category validation
    if (category) {
      const categoryError = validateCategory(category as string);
      if (categoryError) {
        throw createError(400, "Invalid category provided");
      }
    }

    let filter: ProductFilter = {}; // Initialize filter object

    // Set filter based on category
    if (category === "onsale") {
      filter = getOnSaleFilter();
    } else if (category === "best_sellers") {
      const bestSellers = await getBestSellers();
      res.status(200).json({ products: bestSellers });
      return;
    } else if (category) {
      filter.category = category as string;
    }

    // Create a unique cache key based on category, page, and limit
    const cacheKey = `products:${
      category || "all"
    }:page=${validatedPage}:limit=${validatedLimit}`;

    // Attempt to get data from the cache
    const cachedProducts = await getCache(cacheKey);

    if (cachedProducts) {
      res
        .status(200)
        .json({ cachedProducts, message: "Returning cached products" });
      return;
    }

    // Fetch products from the database with pagination and filtering
    const products = await Product.find(filter)
      .skip((validatedPage - 1) * validatedLimit)
      .limit(validatedLimit);

    // Get the total count of products matching the filter
    const totalCount = await Product.countDocuments(filter);

    // Prepare the response
    const response = {
      products,
      totalPages: Math.ceil(totalCount / validatedLimit),
      currentPage: validatedPage,
      message: "Returning products from database",
    };

    // Cache the response data for 1 hour (3600 seconds)
    await setCache(cacheKey, JSON.stringify(response), 3600);

    // Return the response
    res.status(200).json(response);
  } catch (error: any) {
    console.error("Error in getProducts:", error);
    res.status(error.status || 500).json({
      error: error.message || "Internal server error",
    });
  }
};
