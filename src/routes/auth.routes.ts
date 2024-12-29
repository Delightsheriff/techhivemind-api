import { Router } from "express";
import { validateSignin, validateSignup } from "../middleware/validations";
import {
  otpRateLimiter,
  signinLimiter,
  signupLimiter,
} from "../middleware/rateLimiter";
import { getCurrentUser } from "../controllers/auth/getCurrentUser";
import { refreshToken } from "../controllers/auth/refreshToken";
import { signIn } from "../controllers/auth/signIn";
import { resendOTP } from "../controllers/auth/resendOTP";
import { verifyEmail } from "../controllers/auth/verifyEmail";
import { signUp } from "../controllers/auth/signUp";
import { protect } from "../middleware/auth";

const router = Router();

router.post("/signup", signupLimiter, validateSignup, signUp);
router.post("/verify-email", verifyEmail);
router.post("/resend-otp", otpRateLimiter, resendOTP);
router.post("/signin", signinLimiter, validateSignin, signIn);
router.post("/refresh-token", refreshToken);
//Protected routes
router.get("/auth-user", protect, getCurrentUser);

export default router;
