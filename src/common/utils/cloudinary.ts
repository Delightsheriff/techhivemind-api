import { v2 as cloudinary } from "cloudinary";
import { ENVIRONMENT } from "../config/environment";
import { CloudinaryUploadOptions, CloudinaryUploadResult } from "../interface/cloudinaryTypes";

// Cloudinary configuration
cloudinary.config({
  cloud_name: ENVIRONMENT.CLOUDINARY.NAME,
  api_key: ENVIRONMENT.CLOUDINARY.API_KEY,
  api_secret: ENVIRONMENT.CLOUDINARY.API_SECRET,
});



const DEFAULT_OPTIONS: CloudinaryUploadOptions = {
  quality: 'auto:good',
  format: 'auto',
  transformation: [
    { quality: 'auto' },
    { fetch_format: 'auto' }
  ]
};

export const uploadToCloudinary = async (
  file: Express.Multer.File,
  options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResult> => {
  const uploadOptions = {
    ...DEFAULT_OPTIONS,
    ...options
  };

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) reject(error);
        else resolve(result as CloudinaryUploadResult);
      }
    );
    uploadStream.end(file.buffer);
  });
};
