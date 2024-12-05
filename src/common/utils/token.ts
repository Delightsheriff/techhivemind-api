import jwt from "jsonwebtoken";
import { IUser } from "../interface/users";
import { ENVIRONMENT } from "../config/environment";

export interface TokenPayload {
  id: string;
  email: string;
}

export const generateTokens = (user: IUser) => {
  const payload: TokenPayload = {
    id: user._id as string,
    email: user.email,
  };

  const accessToken = jwt.sign(payload, ENVIRONMENT.JWT.ACCESS, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign(payload, ENVIRONMENT.JWT.REFRESH!, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

export const verifyToken = (token: string, secret: string): TokenPayload => {
  return jwt.verify(token, secret) as TokenPayload;
};
