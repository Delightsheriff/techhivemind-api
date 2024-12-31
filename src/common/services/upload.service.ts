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

  // export const uploadProductImages = async (
  //   files: Express.Multer.File[],
  //   options: CloudinaryUploadOptions = {}
  // ): Promise<CloudinaryUploadResult[]> => {
  //   try {
  //     const uploadPromises = files.map(file => 
  //       uploadToCloudinary(file, {
  //         folder: 'Products',
  //         ...options
  //       })
  //     );
  //     return await Promise.all(uploadPromises);
  //   } catch (error) {
  //     console.error('Error uploading product images:', error);
  //     throw new Error('Failed to upload product images');
  //   }
  // };

  export const uploadProductImages = async (
    files: Express.Multer.File[],
    options: CloudinaryUploadOptions = {}
  ): Promise<string[]> => {
    try {
      // Upload each file and map to the secure_url only
      const uploadPromises = files.map(async (file) => {
        const result = await uploadToCloudinary(file, {
          folder: 'Products', // Define the folder where images will be uploaded
          ...options,          // Merge additional options passed to the function
        });
  
        // Assuming result is the Cloudinary upload result, return only the secure_url
        return result.secure_url; // Only return the secure_url
      });
  
      // Wait for all uploads to finish and return only the secure URLs
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error uploading product images:', error);
      throw new Error('Failed to upload product images');
    }
  };