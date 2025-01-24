import Joi from "joi";

export const productSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    "string.empty": "Product name is required",
    "string.min": "Product name must be at least 2 characters long",
    "string.max": "Product name cannot exceed 100 characters",
  }),
  price: Joi.number().positive().precision(2).required().messages({
    "number.base": "Price must be a number",
    "number.positive": "Price must be greater than 0",
    "number.empty": "Price is required",
  }),
  description: Joi.string().trim().min(10).max(1000).required().messages({
    "string.empty": "Description is required",
    "string.min": "Description must be at least 10 characters long",
    "string.max": "Description cannot exceed 1000 characters",
  }),
  category: Joi.string()
    .valid(
      "computers",
      "tablets",
      "drones_cameras",
      "smartphones",
      "headphones",
      "speakers",
      "wearable_tech",
      "tv_home_cinema"
    )
    .required()
    .messages({
      "any.only": "Category must be one of the predefined values",
      "string.empty": "Category is required",
    }),
  stock: Joi.number().integer().min(0).required().messages({
    "number.base": "Stock must be a number",
    "number.integer": "Stock must be an integer",
    "number.min": "Stock cannot be less than 0",
    "number.empty": "Stock is required",
  }),
  onSale: Joi.boolean().optional().messages({
    "boolean.base": "Onsale must be a boolean value",
  }),
  salePrice: Joi.number().optional().min(0).precision(2).messages({
    "number.base": "Sale price must be a number",
    "number.min": "Sale price cannot be less than 0",
  }),
});
