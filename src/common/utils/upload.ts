import { v2 as cloudinary } from "cloudinary";
import { UploadApiOptions, UploadApiResponse } from "cloudinary";
import { ENVIRONMENT } from "../config/environment";

cloudinary.config({
  cloud_name: ENVIRONMENT.CLOUDINARY.NAME,
  api_key: ENVIRONMENT.CLOUDINARY.API_KEY,
  api_secret: ENVIRONMENT.CLOUDINARY.API_SECRET,
});

/**
 * Uploads a single profile photo to Cloudinary with optimization.
 * @param {string} filePath - The local path of the image to upload.
 * @param {object} options - Additional upload options for Cloudinary.
 * @returns {Promise<object>} - The Cloudinary upload result.
 */
export const uploadProfilePhoto = async (
  filePath: string,
  options: UploadApiOptions = {},
): Promise<UploadApiResponse> => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "Profile photos",
      // Optimize without reducing quality
      quality: "auto:good",
      // Preserve original format
      format: "auto",
      // Maintain original resolution
      transformation: [{ quality: "auto" }, { fetch_format: "auto" }],
      ...options,
    });
    return result;
  } catch (error) {
    console.error("Error uploading profile photo:", error);
    throw new Error("Failed to upload profile photo to Cloudinary.");
  }
};

/**
 * Uploads multiple product images to Cloudinary with optimization.
 * @param {string[]} filePaths - An array of local paths of images to upload.
 * @param {object} options - Additional upload options for Cloudinary.
 * @returns {Promise<object[]>} - An array of Cloudinary upload results.
 */
export const uploadProductImages = async (
  filePaths: string[],
  options: UploadApiOptions = {},
): Promise<UploadApiResponse[]> => {
  try {
    const uploadPromises = filePaths.map((filePath) =>
      cloudinary.uploader.upload(filePath, {
        folder: "Products",
        // Optimize without reducing quality
        quality: "auto:good",
        // Preserve original format
        format: "auto",
        // Maintain original resolution
        transformation: [{ quality: "auto" }, { fetch_format: "auto" }],
        ...options,
      }),
    );
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error("Error uploading product images:", error);
    throw new Error("Failed to upload product images to Cloudinary.");
  }
};
