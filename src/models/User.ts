import { Schema } from "mongoose";
import { IUser } from "../common/interface/users";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true, minlength: 8, select: false },
    isVerified: { type: Boolean, default: false },
    termsAccepted: { type: Boolean, default: false },
    accountType: {
      type: String,
      enum: ["customer", "vendor", "admin"],
      default: "customer",
    },
    profilePicture: {
      type: String,
      default: undefined,
    },
    emailVerificationOTP: {
      code: { type: String },
      expiresAt: { type: Date },
    },
    refreshToken: { type: String },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>("User", userSchema);
