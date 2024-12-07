import { createClient } from "redis";
import { ENVIRONMENT } from "./environment";
import { logger } from "../utils/logger";

const client = createClient({
  password: ENVIRONMENT.REDIS.PASSWORD,
  socket: {
    host: ENVIRONMENT.REDIS.HOST,
    port: ENVIRONMENT.REDIS.PORT,
  },
});

// Handle connection events
client.on("connect", () => {
  logger.info("Connected to Redis Successfully");
});

client.on("error", (err) => {
  logger.error("Error connecting to Redis:", err);
});

// Ensure client is properly connected
export async function connectRedis() {
  let attempts = 0;
  while (attempts < 5) {
    try {
      await client.connect();
      logger.info("Connected to Redis");
      return;
    } catch (err) {
      attempts++;
      logger.error(`Error connecting to Redis (Attempt ${attempts}): ${err}`);
      if (attempts >= 5) {
        throw new Error("Failed to connect to Redis after 5 attempts");
      }
      await new Promise((res) => setTimeout(res, 2000)); // Retry every 2 seconds
    }
  }
}

export default client;
