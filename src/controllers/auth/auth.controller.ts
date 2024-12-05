import { Request, Response } from "express";
import { User } from "../../models/User";
import { createError } from "../../common/utils/error";
import { generateTOTP } from "../../common/utils/otp";
import { sendOTPEmail } from "../../common/services/email.service";

export const signUp = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (await User.findOne({ email })) {
      throw createError(400, "User already exists");
    }

    const { code, expiresAt } = generateTOTP();

    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      emailVerificationOTP: {
        code,
        expiresAt,
      },
    });
    await sendOTPEmail(email, code);
    res.status(201).json({
      message:
        "Registration successful. Please check your email for the verification code.",
    });
  } catch (error: any) {
    res.status(error.status || 500).json({
      error: error.message || "Internal server error",
    });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw createError(404, "User not found");
    }

    if (
      !user.emailVerificationOTP ||
      user.emailVerificationOTP.code !== otp ||
      user.emailVerificationOTP.expiresAt < new Date()
    ) {
      throw createError(400, "Invalid or expired OTP");
    }
  } catch (error: any) {
    res.status(error.status || 500).json({
      error: error.message || "Internal server error",
    });
  }
};

export const resendOTP = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw createError(404, "User not found");
    }
    const { code, expiresAt } = generateTOTP();

    // Update user in database
    user.emailVerificationOTP = {
      code,
      expiresAt,
    };

    // Send new OTP via email
    await sendOTPEmail(email, code);

    res.status(200).json({
      message: "New OTP sent to your email",
    });
  } catch (error: any) {
    res.status(error.status || 500).json({
      error: error.message || "Internal server error",
    });
  }
};
