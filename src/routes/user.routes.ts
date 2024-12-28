import { Router } from "express";
import { protect } from "../middleware/auth";
import { updateUser } from "../controllers/user/user.controller";


const router = Router();

router.post('/update-user', protect, updateUser)


export default router;