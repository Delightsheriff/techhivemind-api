import { Router } from "express";
import { protect } from "../middleware/auth";
import {  becomeVendor, updateProfilePicture, updateUser } from "../controllers/user/user.controller";
import { upload } from "../common/utils/upload";


const router = Router();

router.post('/update-user', protect, updateUser)

// router.post("/upload/profile",protect, upload.single("photo"),updateProfilePicture)
router.post("/upload/profile", protect, (req, res, next) => {
    upload.single("photo")(req, res, (err) => {
      if (err) {
        console.error('Multer error:', err);
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  }, updateProfilePicture);

router.post('/become-vendor', protect, becomeVendor)


export default router;