import { Router } from "express";
import { getProducts } from "../controllers/product/getProducts";
import { createProduct } from "../controllers/product/createProduct";
import { protect } from "../middleware/auth";
import { upload } from "../middleware/upload";
import { myProducts } from "../controllers/product/myProducts";
import { editProduct } from "../controllers/product/editProduct";
import { getSingleProduct } from "../controllers/product/getSingleProduct";
import { searchProducts } from "../controllers/product/searchProducts";

const router = Router();

router.get("/one-product/:id", getSingleProduct);
router.patch(
  "/update-product/:id",
  protect,
  upload.array("images", 5),
  editProduct
);

router.get("/products", getProducts);

router.post(
  "/create-product",
  protect,
  upload.array("images", 5),
  createProduct
);

router.get("/my-products", protect, myProducts);

router.get("/search", searchProducts);

export default router;
