import app from "./app";
import { closeDbConnection, connectDB } from "./common/config/database";
import { ENVIRONMENT } from "./common/config/environment";
import client, { connectRedis } from "./common/config/redis";
import { logger } from "./common/utils/logger";

/**
 * Starts the server by connecting to the database and then listening on the specified port.
 * If an error occurs during the process, it logs the error and exits the process.
 *
 * @async
 * @function startServer
 * @returns {Promise<void>} A promise that resolves when the server starts successfully.
 */
const startServer = async (): Promise<void> => {
  try {
    // Ensure Redis is connected before starting the server
    await connectRedis();

    await connectDB();

    app.listen(ENVIRONMENT.APP.PORT, () => {
      logger.info(`Server is running on port ${ENVIRONMENT.APP.PORT}`);
    });
  } catch (error) {
    logger.error(`Error starting server: ${error}`);
    process.exit(1);
  }
};

// Gracefully shutdown the server when a SIGINT signal is received (e.g. Ctrl+C)
process.on("SIGINT", async () => {
  logger.info("Shutting down server...");

  // Close Redis connection only if it's not already closed
  if (client.isOpen) {
    await client.quit();
    logger.info("Redis connection closed");
  } else {
    logger.info("Redis client was already closed");
  }

  await closeDbConnection();
  logger.info("Database connection closed");
  process.exit(0);
});

startServer();
