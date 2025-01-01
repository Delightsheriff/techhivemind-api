import { Router } from "express";
import { getProducts } from "../controllers/product/getProducts";
import { createProduct } from "../controllers/product/createProduct";
import { protect } from "../middleware/auth";
import { upload } from "../middleware/upload";
import { getSingleProduct } from "../controllers/product/getSingleProduct";

const router = Router();

router.get("/products", getProducts);
router.get("/product/:id", getSingleProduct);

router.post(
  "/create-product",
  protect,
  upload.array("images", 5),
  createProduct
);

export default router;
