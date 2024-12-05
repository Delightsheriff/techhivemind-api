import { Router } from "express";
import { validateSignin, validateSignup } from "../middleware/validations";
import {
  otpRateLimiter,
  signinLimiter,
  signupLimiter,
} from "../middleware/rateLimiter";
import {
  getCurrentUser,
  refreshToken,
  resendOTP,
  signIn,
  signUp,
  verifyEmail,
} from "../controllers/auth/auth.controller";
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
