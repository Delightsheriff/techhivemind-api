import app from "./app";
import { closeDbConnection, connectDB } from "./common/config/database";
import { ENVIRONMENT } from "./common/config/environment";
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

  await closeDbConnection();
  logger.info("Database connection closed");
  process.exit(0);
});

startServer();
