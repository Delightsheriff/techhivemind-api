import { Router } from "express";
import { getProducts } from "../controllers/product/getProducts";

const router = Router();

router.get('/products', getProducts)

export default router;