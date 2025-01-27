// import { Request, Response } from "express";
// import { Product } from "../../models/Product";
// import { getCache, setCache } from "../../common/utils/caching";
// import { validatePagination } from "../../common/utils/products";
// import { createError } from "../../common/utils/error";

// export const searchProducts = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const { query, page = 1, limit = 12 } = req.query;

//     const pageNumber = parseInt(page as string, 10);
//     const limitNumber = parseInt(limit as string, 10);

//     // Validate pagination parameters
//     const { error: paginationError, value } = validatePagination(
//       pageNumber,
//       limitNumber
//     );
//     if (paginationError) {
//       throw createError(400, "Invalid pagination parameters");
//     }

//     const { page: validatedPage, limit: validatedLimit } = value;

//     if (!query) {
//       throw createError(400, "Search query is required");
//     }

//     // Create a unique cache key based on the search query, page, and limit
//     const cacheKey = `search:${query}:page=${validatedPage}:limit=${validatedLimit}`;

//     // Attempt to get data from the cache
//     const cachedProducts = await getCache(cacheKey);

//     if (cachedProducts) {
//       res
//         .status(200)
//         .json({ cachedProducts, message: "Returning cached search results" });
//       return;
//     }

//     // Perform the search using MongoDB's $text search or regex
//     const products = await Product.find({
//       $text: { $search: query as string },
//     })
//       .skip((validatedPage - 1) * validatedLimit)
//       .limit(validatedLimit);

//     // Get the total count of products matching the search query
//     const totalCount = await Product.countDocuments({
//       $text: { $search: query as string },
//     });

//     // Prepare the response
//     const response = {
//       products,
//       totalPages: Math.ceil(totalCount / validatedLimit),
//       currentPage: validatedPage,
//       message: "Returning search results from database",
//     };

//     // Cache the response data for 1 hour (3600 seconds)
//     await setCache(cacheKey, JSON.stringify(response), 3600);

//     // Return the response
//     res.status(200).json(response);
//   } catch (error: any) {
//     console.error("Error in searchProducts:", error);
//     res.status(error.status || 500).json({
//       error: error.message || "Internal server error",
//     });
//   }
// };

import { Request, Response } from "express";
import { Product } from "../../models/Product";
import { getCache, setCache } from "../../common/utils/caching";
import { validatePagination } from "../../common/utils/products";
import { createError } from "../../common/utils/error";

// Helper function to escape regex special characters
const escapeRegex = (str: string) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export const searchProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { query, page = 1, limit = 12 } = req.query;

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

    if (!query) {
      throw createError(400, "Search query is required");
    }

    // Create a unique cache key based on the search query, page, and limit
    const cacheKey = `search:${query}:page=${validatedPage}:limit=${validatedLimit}`;

    // Attempt to get data from the cache
    const cachedProducts = await getCache(cacheKey);

    if (cachedProducts) {
      res
        .status(200)
        .json({ cachedProducts, message: "Returning cached search results" });
      return;
    }

    // Escape special regex characters and create case-insensitive regex
    const escapedQuery = escapeRegex(query as string);
    const searchRegex = new RegExp(escapedQuery, "i");

    // Perform the search using regex on name and description fields
    const products = await Product.find({
      $or: [
        { name: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
      ],
    })
      .skip((validatedPage - 1) * validatedLimit)
      .limit(validatedLimit);

    // Get the total count of matching products
    const totalCount = await Product.countDocuments({
      $or: [
        { name: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
      ],
    });

    // Prepare the response
    const response = {
      products,
      totalPages: Math.ceil(totalCount / validatedLimit),
      currentPage: validatedPage,
      message: "Returning search results from database",
    };

    // Cache the response data for 1 hour (3600 seconds)
    await setCache(cacheKey, JSON.stringify(response), 3600);

    // Return the response
    res.status(200).json(response);
  } catch (error: any) {
    console.error("Error in searchProducts:", error);
    res.status(error.status || 500).json({
      error: error.message || "Internal server error",
    });
  }
};
