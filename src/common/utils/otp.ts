import crypto from "crypto";

export const generateOTP = (length: number = 6): string => {
  return crypto.randomInt(100000, 999999).toString();
};

export const generateTOTP = () => {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return {
    code: generateOTP(),
    expiresAt,
  };
};
