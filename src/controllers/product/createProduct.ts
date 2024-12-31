import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import { createError } from "../../common/utils/error";
import { deleteCache, getCache, setCache } from "../../common/utils/caching";
import { User } from "../../models/User";
import { Product } from "../../models/Product";
import { uploadProductImages } from "../../common/services/upload.service";

export const createProduct = async(req:AuthRequest, res:Response) => {

    try {
        console.log("Create product request received");
        const userId = req.user?._id;
        const product = req.body;
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        console.log("Files:", files);
        console.log('file', req.file)
        console.log("Product:", product);

    if (!userId) {
      throw createError(401, "Unauthorized, sign in again");
    }

    // Attempt to get user data from cache
    let user = await getCache(`user:${userId}`);


    // Fetch from DB if not in cache
    if (!user) {
      const dbUser = await User.findById(userId);
      if (!dbUser) {
        throw createError(404, "User not found");
      }
      // Cache the user object - setCache handles stringification
      await setCache(`user:${userId}`, dbUser.toJSON(), 3600);
      user = dbUser;
    }
    if (user.accountType !== "vendor") {
        throw createError(403, "Forbidden, you are not a vendor");
    }


  const uploadedImages = await uploadProductImages(files.images);

    // Create product with image URLs
    const newProduct = await Product.create({
      ...product,
      vendor: userId,
      images: uploadedImages,  // Assuming the product schema has an 'images' field for storing URLs
    });

    const savedProduct = await newProduct.save();

    // Create a cache key for the product list (e.g., for 'category' = 'electronics')
    const cacheKey = `products:${savedProduct.category}:page=1:limit=10`; // Modify this cache key as needed for pagination

    // Delete the cache to ensure the next product listing fetches fresh data
    await deleteCache(cacheKey);
    console.log("Deleted cache for products list.");

    // Return the newly created product
    res.status(201).json({
      message: "Product created successfully!",
      product: savedProduct,
    });
     

    } catch (error: any) {
        res.status(error.status || 500).json({
          error: error.message || "Internal server error",
        });
      }
}