import dotenv from "dotenv";
import { IEnvironment } from "../interface/environment";
dotenv.config();

export const ENVIRONMENT: IEnvironment = {
  APP: {
    NAME: process.env.APP_NAME,
    PORT: parseInt(process.env.PORT || "2024"),
    ENV: process.env.NODE_ENV,
    CLIENT: process.env.CLIENT,
  },
  CLIENT: {
    URL: process.env.CLIENT_URL!,
  },
  DB: {
    URI: process.env.MONGO_URI!,
  },
  REDIS: {
    PASSWORD: process.env.REDIS_PASSWORD!,
    PORT: parseInt(process.env.REDIS_PORT!),
    HOST: process.env.REDIS_HOST!,
  },
  EMAIL: {
    USER: process.env.USER_EMAIL!,
    PASSWORD: process.env.USER_PASSWORD!,
  },
  JWT: {
    ACCESS: process.env.JWT_SECRET!,
    REFRESH: process.env.JWT_REFRESH_SECRET!,
  },
};
