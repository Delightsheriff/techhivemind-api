import { v2 as cloudinary } from "cloudinary";
import { UploadApiOptions, UploadApiResponse } from "cloudinary";
import multer from "multer";
import { ENVIRONMENT } from "../config/environment";

// Cloudinary configuration
cloudinary.config({
  cloud_name: ENVIRONMENT.CLOUDINARY.NAME,
  api_key: ENVIRONMENT.CLOUDINARY.API_KEY,
  api_secret: ENVIRONMENT.CLOUDINARY.API_SECRET,
});

// Multer configuration
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (!file.mimetype.startsWith("image/")) {
    cb(new Error("Only image files are allowed"));
    return;
  }
  cb(null, true);
};

export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Base upload function
const uploadToCloudinary = async (
  file: Express.Multer.File,
  folder: string,
  options: UploadApiOptions = {}
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        quality: "auto:good",
        format: "auto",
        transformation: [{ quality: "auto" }, { fetch_format: "auto" }],
        ...options,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result as UploadApiResponse);
      }
    );
    uploadStream.end(file.buffer);
  });
};

// Profile photo upload
export const uploadProfilePhoto = async (
  file: Express.Multer.File,
  options: UploadApiOptions = {}
): Promise<UploadApiResponse> => {
  try {
    return await uploadToCloudinary(file, "Profile photos", options);
  } catch (error) {
    console.error("Error uploading profile photo:", error);
    throw new Error("Failed to upload profile photo");
  }
};

// Product images upload
export const uploadProductImages = async (
  files: Express.Multer.File[],
  options: UploadApiOptions = {}
): Promise<UploadApiResponse[]> => {
  try {
    const uploadPromises = files.map((file) =>
      uploadToCloudinary(file, "Products", options)
    );
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error("Error uploading product images:", error);
    throw new Error("Failed to upload product images");
  }
};