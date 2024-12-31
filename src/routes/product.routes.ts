import { Router } from "express";
import { getProducts } from "../controllers/product/getProducts";
import { createProduct } from "../controllers/product/createProduct";
import { validateProduct } from "../middleware/validations";
import { protect } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = Router();

router.get('/products', getProducts)

router.post('/create-product',protect,upload.array('images', 5)  ,createProduct)

export default router;