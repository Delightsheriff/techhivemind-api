import client from "../config/redis";
import { logger } from "./logger";

/**
 * Set a value in the Redis cache.
 * @param key - The key to store the value under.
 * @param value - The value to store (can be an object or string).
 * @param expirationInSeconds - Optional expiration time in seconds.
 */
export const setCache = async (
  key: string,
  value: any,
  expirationInSeconds?: number,
): Promise<void> => {
  const stringValue = typeof value === "string" ? value : JSON.stringify(value);

  try {
    if (expirationInSeconds) {
      await client.setEx(key, expirationInSeconds, stringValue);
    } else {
      await client.set(key, stringValue);
    }
    logger.info(`Cache set successfully for key: ${key}`);
  } catch (error: any) {
    logger.error(
      `Failed to set cache for key: ${key}. Error: ${error.message}`,
    );
    throw error; // Optionally re-throw to handle it higher up
  }
};

/**
 * Get a value from the Redis cache.
 * @param key - The key to retrieve the value from.
 * @returns The value stored in Redis (parsed if it's JSON).
 */
export const getCache = async (key: string): Promise<any | null> => {
  const value = await client.get(key);
  try {
    return value ? JSON.parse(value) : null;
  } catch {
    return value; // Return as string if not JSON
  }
};

/**
 * Delete a value from the Redis cache.
 * @param key - The key to delete.
 */
export const deleteCache = async (key: string): Promise<void> => {
  await client.del(key);
};

/**
 * Check if a key exists in the Redis cache.
 * @param key - The key to check.
 * @returns A boolean indicating if the key exists.
 */
export const hasCache = async (key: string): Promise<boolean> => {
  const exists = await client.exists(key);
  return exists === 1;
};
