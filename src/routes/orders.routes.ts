import { Router } from "express";
import { protect } from "../middleware/auth";
import { getOrders } from "../controllers/order/allOrders";
import { getOrder } from "../controllers/order/getOrder";
import { cancelOrder } from "../controllers/order/cancelOrder";
import { createOrder } from "../controllers/order/createOrder";

const router = Router();

router.get("/", protect, getOrders);
router.get("/one/:id", protect, getOrder);
router.patch("/cancel/:id", protect, cancelOrder);
router.post("/create", protect, createOrder);

export default router;
