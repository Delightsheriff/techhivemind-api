import { NextFunction, Request, Response } from "express";
import { User } from "../../models/User";
import { createError } from "../../common/utils/error";
import { generateTOTP } from "../../common/utils/otp";
import { sendOTPEmail } from "../../common/services/email.service";
import { generateTokens, verifyToken } from "../../common/utils/token";
import { getCache, setCache } from "../../common/utils/caching";
import { ENVIRONMENT } from "../../common/config/environment";
import { AuthRequest } from "../../middleware/auth";

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
        "Please verify your email. A new verification code has been sent to your email.",
      );
    }

    const { accessToken, refreshToken } = generateTokens(user);

    user.refreshToken = refreshToken;
    await user.save();

    // Sanitize user data (exclude sensitive fields)
    const sanitizedUser = { ...user.toObject(), password: undefined };

    // Cache user data for future use
    await setCache(`user:${user.id}`, sanitizedUser, 3600); // Cache for 1 hour

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

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(createError(401, "Refresh token is required"));
    }

    // Verify the refresh token using the REFRESH secret
    const decoded = verifyToken(refreshToken, ENVIRONMENT.JWT.REFRESH);

    const user = await User.findById(decoded.id);
    if (!user) {
      return next(createError(401, "User not found"));
    }

    // Generate new access and refresh tokens
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      generateTokens(user);

    user.refreshToken = newRefreshToken;
    await user.save();

    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      message: "Refresh token successful",
    });
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return next(createError(401, "Token has expired"));
    }
    if (error.name === "JsonWebTokenError") {
      return next(createError(401, "Invalid token"));
    }

    // Propagate other errors
    next(
      createError(
        error.status || 500,
        error.message || "Internal server error",
      ),
    );
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    // Check cache for user data
    let user = await getCache(`user:${userId}`);
    if (!user) {
      // Fetch from database if cache miss
      user = await User.findById(userId).lean();
      if (!user) {
        throw createError(404, "User not found");
      }

      // Sanitize user data and cache it again
      const sanitizedUser = { ...user, password: undefined };
      await setCache(`user:${userId}`, sanitizedUser, 3600); // Cache for 1 hour
      user = sanitizedUser;
    }

    res.status(200).json({ user });
  } catch (error: any) {
    res.status(error.status || 500).json({
      error: error.message || "Internal server error",
    });
  }
};
