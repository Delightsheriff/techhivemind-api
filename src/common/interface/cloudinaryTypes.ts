import { UploadApiOptions, UploadApiResponse } from 'cloudinary';

export interface CloudinaryUploadResult extends UploadApiResponse {
  secure_url: string;
  public_id: string;
}

export interface CloudinaryConfig {
  cloud_name: string;
  api_key: string;
  api_secret: string;
}

export interface CloudinaryUploadOptions extends UploadApiOptions {
  folder?: string;
  quality?: string;
  format?: string;
  transformation?: Array<Record<string, any>>;
}