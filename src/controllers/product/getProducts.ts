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

/**
 * Retrieves a list of products based on the provided query parameters.
 * Supports filtering by category, pagination, and caching of results.
 *
 * @param req - The request object containing query parameters for category, page, and limit.
 * @param res - The response object used to send back the retrieved products or errors.
 *
 * Query Parameters:
 * - `category` (string): The category to filter products by. Special categories include "onsale" and "best_sellers".
 * - `page` (number, optional): The page number for pagination. Defaults to 1.
 * - `limit` (number, optional): The number of products per page. Defaults to 10.
 *
 * @throws {Error} If the category or pagination parameters are invalid.
 * @throws {Error} If there is an internal server error while fetching products.
 *
 * @returns {void} Sends a JSON response containing the list of products, total pages, and current page.
 */
export const getProducts = async (req: Request, res: Response) => {
  try {
    const { category, page = 1, limit = 12 } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);

    const categoryError = validateCategory(category as string);
    if (categoryError) {
      throw createError(400, "Invalid category provided");
    }

    const { error: paginationError, value } = validatePagination(
      pageNumber,
      limitNumber
    );
    if (paginationError) {
      throw createError(400, "Invalid pagination parameters");
    }

    const { page: validatedPage, limit: validatedLimit } = value;

    let filter: ProductFilter = {}; // Initialize filter with the correct type

    // Set filter based on category
    if (category === "onsale") {
      filter = getOnSaleFilter(); // Filter products that are on sale
    } else if (category === "best_sellers") {
      const bestSellers = await getBestSellers(); // Get best-selling products
      res.json({ products: bestSellers }); // Directly return best sellers
    } else if (typeof category === "string") {
      // Ensure it's a string
      filter.category = category; // Filter by specific product category
    }

    // Create a unique cache key based on category, page, and limit
    const cacheKey = `products:${
      category || "all"
    }:page=${validatedPage}:limit=${validatedLimit}`;

    // Attempt to get data from the cache
    const cachedProducts = await getCache(cacheKey);
    if (cachedProducts) {
      console.log("Returning cached products");
      res.json({ products: JSON.parse(cachedProducts) }); // Return cached data
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
