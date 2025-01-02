// import { Response } from "express";
// import { AuthRequest } from "../../middleware/auth";
// import { createError } from "../../common/utils/error";
// import { deleteCache, getCache, setCache } from "../../common/utils/caching";
// import { User } from "../../models/User";
// import { Product } from "../../models/Product";
// import { uploadProductImages } from "../../common/services/upload.service";
// import { productSchema } from "../../common/schemas/productSchema";

// export const editProduct = async (req: AuthRequest, res: Response) => {
//   try {
//     const userId = req.user?._id;
//     const productId = req.params.id;
//     const updates = req.body;
//     const files = req.files as Express.Multer.File[];

//     if (!userId) {
//       throw createError(401, "Unauthorized, sign in again");
//     }

//     // Validate request body
//     const { error, value } = productSchema.validate(updates, {
//       abortEarly: false,
//       stripUnknown: true,
//     });

//     if (error) {
//       const validationErrors = error.details.map((detail) => ({
//         field: detail.path[0],
//         message: detail.message,
//       }));
//       res.status(400).json({
//         error: "Validation failed",
//         errors: validationErrors,
//       });
//     }

//     // Use validated and sanitized data
//     const validatedUpdates = value;

//     let user = await getCache(`user:${userId}`);
//     if (!user) {
//       const dbUser = await User.findById(userId);
//       if (!dbUser) {
//         throw createError(404, "User not found");
//       }
//       await setCache(`user:${userId}`, dbUser.toJSON(), 3600);
//       user = dbUser;
//     }

//     if (user.accountType !== "vendor") {
//       throw createError(403, "Forbidden, you are not a vendor");
//     }

//     const product = await Product.findById(productId);
//     if (!product) {
//       throw createError(404, "Product not found");
//     }

//     if (product.vendor.toString() !== userId) {
//       throw createError(
//         403,
//         "Forbidden, you are not the owner of this product"
//       );
//     }

//     // Handle file uploads if any
//     if (files && files.length > 0) {
//       const uploadedImages = await uploadProductImages(files);
//       validatedUpdates.images = uploadedImages;
//     }

//     // Update the product
//     Object.assign(product, validatedUpdates);
//     const updatedProduct = await product.save();

//     // Invalidate relevant cache
//     const cacheKey = `products:${updatedProduct.category}:page=1:limit=10`;
//     await deleteCache(cacheKey);

//     res.status(200).json({
//       message: "Product updated successfully!",
//       product: updatedProduct,
//     });
//   } catch (error: any) {
//     const status = error.status || 500;
//     const message = error.message || "Internal server error";
//     const additionalData = error.additionalData || {};

//     res.status(status).json({
//       error: message,
//       ...additionalData,
//     });
//     return;
//   }
// };

import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import { createError } from "../../common/utils/error";
import { deleteCache, getCache, setCache } from "../../common/utils/caching";
import { User } from "../../models/User";
import { Product } from "../../models/Product";
import { uploadProductImages } from "../../common/services/upload.service";
import { productSchema } from "../../common/schemas/productSchema";

export const editProduct = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?._id;
    const productId = req.params.id;
    const updates = req.body;
    const files = req.files as Express.Multer.File[];

    if (!userId) {
      throw createError(401, "Unauthorized, sign in again");
    }

    // First, find the product to ensure it exists
    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      throw createError(404, "Product not found");
    }

    // Check if the user is the owner of the product
    if (existingProduct.vendor.toString() !== userId.toString()) {
      throw createError(
        403,
        "Forbidden, you are not the owner of this product"
      );
    }

    // Verify user is a vendor
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

    // Create a validation object that makes all fields optional
    const updateSchema = productSchema.fork(
      Object.keys(productSchema.describe().keys),
      (schema) => schema.optional()
    );

    // Validate request body
    const { error, value } = updateSchema.validate(updates, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const validationErrors = error.details.map((detail) => ({
        field: detail.path[0],
        message: detail.message,
      }));
      res.status(400).json({
        error: "Validation failed",
        errors: validationErrors,
      });
      return;
    }

    // Prepare update object
    const updateData = { ...value };

    // Handle file uploads if any
    if (files && files.length > 0) {
      const uploadedImages = await uploadProductImages(files);
      updateData.images = uploadedImages;
    }

    // Update the product using findByIdAndUpdate to ensure atomic update
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      throw createError(404, "Product not found after update");
    }

    // Invalidate relevant caches
    const oldCategoryKey = `products:${existingProduct.category}:page=1:limit=10`;
    const newCategoryKey = `products:${updatedProduct.category}:page=1:limit=10`;

    await Promise.all([
      deleteCache(oldCategoryKey),
      deleteCache(newCategoryKey),
      deleteCache(`product:${productId}`),
    ]);

    res.status(200).json({
      message: "Product updated successfully!",
      product: updatedProduct,
    });
    return;
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.message || "Internal server error";
    const additionalData = error.additionalData || {};

    res.status(status).json({
      error: message,
      ...additionalData,
    });
    return;
  }
};
