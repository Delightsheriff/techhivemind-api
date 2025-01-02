import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import { createError } from "../../common/utils/error";
import { deleteCache, getCache, setCache } from "../../common/utils/caching";
import { User } from "../../models/User";
import { Product } from "../../models/Product";
import { uploadProductImages } from "../../common/services/upload.service";
import { productSchema } from "../../common/schemas/productSchema";

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    // console.log("Create product request received");
    const userId = req.user?._id;
    const product = req.body;
    const files = req.files as Express.Multer.File[];

    if (!userId) {
      throw createError(401, "Unauthorized, sign in again");
    }

    // Validate request body
    const { error, value } = productSchema.validate(product, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const validationErrors = error.details.map((detail) => ({
        field: detail.path[0],
        message: detail.message,
      }));
      // Return validation errors in response directly
      res.status(400).json({
        error: "Validation failed",
        errors: validationErrors,
      });
    }

    // Use validated and sanitized data
    const validatedProduct = value;

    let user = await getCache(`user:${userId}`);
    if (!user) {
      const dbUser = await User.findById(userId);
      if (!dbUser) {
        throw createError(404, "User not found");
      }
      await setCache(`user:${userId}`, dbUser.toJSON(), 3600);
      user = dbUser;
    }

    if (user.accountType !== "vendor") {
      throw createError(403, "Forbidden, you are not a vendor");
    }

    const uploadedImages = await uploadProductImages(files);

    const newProduct = await Product.create({
      ...validatedProduct,
      vendor: userId,
      images: uploadedImages,
    });

    const savedProduct = await newProduct.save();
    const cacheKey = `products:${savedProduct.category}:page=1:limit=10`;
    await deleteCache(cacheKey);

    res.status(201).json({
      message: "Product created successfully!",
      product: savedProduct,
    });
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.message || "Internal server error";
    const additionalData = error.additionalData || {};

    res.status(status).json({
      error: message,
      ...additionalData,
    });
  }
};
