import { Router } from "express";
import { addToWishlist } from "../controllers/wishlist/addToWishlist";
import { getAllWishlistItems } from "../controllers/wishlist/getWishlist";
import { removeFromWishlist } from "../controllers/wishlist/removeFromWishlist";
import { protect } from "../middleware/auth";

const router = Router();

router.post("/", protect, addToWishlist);
router.get("/", protect, getAllWishlistItems);
router.delete("/:productId", protect, removeFromWishlist);

export default router;
