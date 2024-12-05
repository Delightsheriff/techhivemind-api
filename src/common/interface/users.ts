import { Document } from "mongoose";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isVerified: boolean;
  accountType: string;
  profilePicture?: string;
  emailVerificationOTP?: {
    code: string;
    expiresAt: Date;
  };
  refreshToken?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}
