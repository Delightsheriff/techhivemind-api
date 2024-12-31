import { CloudinaryUploadOptions, CloudinaryUploadResult } from "../interface/cloudinaryTypes";
import { uploadToCloudinary } from "../utils/cloudinary";


export const uploadProfilePhoto = async (
    file: Express.Multer.File,
    options: CloudinaryUploadOptions = {}
  ): Promise<CloudinaryUploadResult> => {
    try {
      return await uploadToCloudinary(file, {
        folder: 'Profile photos',
        ...options
      });
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      throw new Error('Failed to upload profile photo');
    }
  };

  export const uploadProductImages = async (
    files: Express.Multer.File[],
    options: CloudinaryUploadOptions = {}
  ): Promise<CloudinaryUploadResult[]> => {
    try {
      const uploadPromises = files.map(file => 
        uploadToCloudinary(file, {
          folder: 'Products',
          ...options
        })
      );
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error uploading product images:', error);
      throw new Error('Failed to upload product images');
    }
  };