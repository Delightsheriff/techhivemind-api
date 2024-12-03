import winston from "winston";
import { ENVIRONMENT } from "../config/environment";

/**
 * Logger instance configured with Winston.
 *
 * The logger is set to log messages at the "info" level and above.
 * It uses a combination of timestamp and JSON format for log messages.
 *
 * The logger has two transports:
 * - A file transport that logs "error" level messages to "error.log".
 * - A file transport that logs all messages to "combined.log".
 *
 * @constant {winston.Logger} logger - The configured Winston logger instance.
 */

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

if (ENVIRONMENT.APP.ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  );
}
