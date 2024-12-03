import app from "./app";
import { closeDbConnection, connectDB } from "./common/config/database";
import { ENVIRONMENT } from "./common/config/environment";
import { logger } from "./common/utils/logger";

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    // Start the Express server
    app.listen(ENVIRONMENT.APP.PORT, () => {
      logger.info(`Server is running on port ${ENVIRONMENT.APP.PORT}`);
    });
  } catch (error) {
    logger.error(`Error starting server: ${error}`);
    process.exit(1);
  }
};

process.on("SIGINT", async () => {
  logger.info("Shutting down server...");

  await closeDbConnection();
  logger.info("Database connection closed");
  process.exit(0);
});

startServer();
