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
