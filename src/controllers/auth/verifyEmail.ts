import { Request, Response } from "express";
import { sendWelcomeEmail } from "../../common/services/email.service";
import { createError } from "../../common/utils/error";
import { User } from "../../models/User";
import { undefined } from "./auth.controller";


export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw createError(404, "User not found");
    }

    if (!user.emailVerificationOTP ||
      user.emailVerificationOTP.code !== otp ||
      new Date().getTime() > user.emailVerificationOTP.expiresAt.getTime()) {
      throw createError(400, "Invalid or expired OTP");
    }
    // Proceed with email verification logic
    user.isVerified = true;
    user.emailVerificationOTP = undefined;
    await user.save();

    await sendWelcomeEmail(email, user.firstName);

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error: any) {
    res.status(error.status || 500).json({
      error: error.message || "Internal server error",
    });
  }
};
