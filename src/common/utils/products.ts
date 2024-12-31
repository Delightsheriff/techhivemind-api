import Joi from "joi";
import { Product } from "../../models/Product";

// Define valid categories
const validCategories = [
    "computers", 
    "tablets", 
    "drones_&_cameras", 
    "smartphones", 
    "headphones", 
    "speakers", 
    "wearable_tech", 
    "tv_&home_cinema",
    "best_sellers", 
    "onsale"
  ];
  
  // Helper function to validate category
  export const validateCategory = (category: string) => {
    const categorySchema = Joi.string().valid(...validCategories).optional();
    const { error } = categorySchema.validate(category);
    return error;
  };
  
  // Helper function to validate pagination
  export const validatePagination = (page:number, limit:number) => {
    const paginationSchema = Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
    });
    return paginationSchema.validate({ page: Number(page), limit: Number(limit) });
  };
  
// Helper function to get 12 random products (representing best sellers)
export const getBestSellers = async () => {
    return await Product.aggregate([
      { $sample: { size: 12 } }  // Randomly sample 12 products as best sellers
    ]);
  };
  
  // Helper function for onsale filter
  export const getOnSaleFilter = () => {
    return { onSale: true }; // Filter products that are on sale
  };