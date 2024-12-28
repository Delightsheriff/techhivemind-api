import { Router } from "express";
import { protect } from "../middleware/auth";
import {  becomeVendor, updateUser } from "../controllers/user/user.controller";


const router = Router();

router.post('/update-user', protect, updateUser)

router.post('/become-vendor', protect, becomeVendor)


export default router;