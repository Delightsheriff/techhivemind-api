import { Router } from "express";
import { addToWishlist } from "../controllers/wishlist/addToWishlist";
import { getAllWishlistItems } from "../controllers/wishlist/getWishlist";
import { removeFromWishlist } from "../controllers/wishlist/removeFromWishlist";

const router = Router();

router.post("/", addToWishlist); // Add product to wishlist (POST /wishlist)
router.get("/", getAllWishlistItems); // Get all wishlist items (GET /wishlist)
router.delete("/:productId", removeFromWishlist); // Remove product from wishlist (DELETE /wishlist/:productId)

export default router;
