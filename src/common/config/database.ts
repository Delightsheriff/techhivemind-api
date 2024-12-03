import mongoose from "mongoose";
import { ENVIRONMENT } from "./environment";
import { logger } from "../utils/logger";

/**
 * Asynchronously connects to the MongoDB database using the connection URL
 * specified in the environment configuration.
 *
 * @returns {Promise<void>} A promise that resolves when the connection is successful.
 * @throws Will log an error and exit the process if the connection fails.
 */
export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(ENVIRONMENT.DB.URL);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error("Error connecting to MongoDB: ", error);
    process.exit(1);
  }
};

export const closeDbConnection = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    logger.info("Database Connection Closed");
  } catch (error) {
    logger.error("Error closing database connection: ", error);
  }
};
