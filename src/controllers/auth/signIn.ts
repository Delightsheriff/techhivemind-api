import { Request, Response } from "express";
import { sendOTPEmail } from "../../common/services/email.service";
import { setCache } from "../../common/utils/caching";
import { createError } from "../../common/utils/error";
import { generateTOTP } from "../../common/utils/otp";
import { generateTokens } from "../../common/utils/token";
import { User } from "../../models/User";
import { undefined } from "./auth.controller";


export const signIn = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      throw createError(401, "Invalid Credentials");
    }
    if (!user.isVerified) {
      // Resend verification email
      const { code, expiresAt } = generateTOTP();
      user.emailVerificationOTP = { code, expiresAt };
      await user.save();

      await sendOTPEmail(user.email, code);

      throw createError(
        403,
        "Please verify your email. A new verification code has been sent to your email."
      );
    }

    const { accessToken, refreshToken } = generateTokens(user);

    user.refreshToken = refreshToken;
    await user.save();

    // Sanitize user data (exclude sensitive fields)
    const sanitizedUser = { ...user.toObject(), password: undefined };

    // Cache user data for future use
    await setCache(`user:${user._id}`, sanitizedUser, 3600); // Cache for 1 hour

    res.status(200).json({
      accessToken,
      refreshToken,
      user: sanitizedUser,
      message: "SignIn successful",
    });
  } catch (error: any) {
    res.status(error.status || 500).json({
      error: error.message || "Internal server error",
    });
  }
};
