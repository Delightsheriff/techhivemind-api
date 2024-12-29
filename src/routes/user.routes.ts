import { Router } from "express";
import { protect } from "../middleware/auth";
import { updateProfilePicture } from "../controllers/user/updateProfilePicture";
import { updateUser } from "../controllers/user/updateUser";
import { becomeVendor } from "../controllers/user/becomeVendor";
import upload from "../middleware/upload";



const router = Router();

router.post('/update-user', protect, updateUser)

// router.post("/upload/profile",protect, upload.single("file"),updateProfilePicture)
router.post('/upload', upload.single('file'), (req, res) => {
    console.log('File:', req.file); // Log the file
    console.log('Body:', req.body); // Log other form data
    if (!req.file) {
      res.status(400).send('No file uploaded.');
    }
    res.status(200).json({ file: req.file });
  });


router.post('/become-vendor', protect, becomeVendor)


export default router;