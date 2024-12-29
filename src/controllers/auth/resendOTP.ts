import { Request, Response } from "express";
import { sendOTPEmail } from "../../common/services/email.service";
import { createError } from "../../common/utils/error";
import { generateTOTP } from "../../common/utils/otp";
import { User } from "../../models/User";


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
    await user.save();

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
