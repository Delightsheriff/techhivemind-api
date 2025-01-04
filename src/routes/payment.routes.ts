import { Router } from "express";
import { protect } from "../middleware/auth";
import { initializePayment } from "../controllers/payment/initializePayment";
import { verifyPayment } from "../controllers/payment/verifyPayment";

const router = Router();

router.post("/initialize", protect, initializePayment);
router.get("/verify", protect, verifyPayment);

export default router;
