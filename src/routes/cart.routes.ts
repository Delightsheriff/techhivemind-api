import { Router } from "express";
import { protect } from "../middleware/auth";
import { addToCart } from "../controllers/cart/addToCart";
import { getAllCartItems } from "../controllers/cart/getCart";
import { removeFromCart } from "../controllers/cart/removeFromCart";
import { updateCartItem } from "../controllers/cart/updateCart";

const router = Router();

router.post("/add", protect, addToCart); // Add to cart
router.get("/get", protect, getAllCartItems); // Get all cart items
router.delete("/", protect, removeFromCart); // Remove from cart
router.patch("/", protect, updateCartItem); // Update cart item quantity

export default router;
