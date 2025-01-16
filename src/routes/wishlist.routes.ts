import { Router } from "express";
import { addToWishlist } from "../controllers/wishlist/addToWishlist";
import { getAllWishlistItems } from "../controllers/wishlist/getWishlist";
import { removeFromWishlist } from "../controllers/wishlist/removeFromWishlist";
import { protect } from "../middleware/auth";

const router = Router();

router.post("/add", protect, addToWishlist);
router.get("/get", protect, getAllWishlistItems);
router.delete("/remove", protect, removeFromWishlist);

export default router;
