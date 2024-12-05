import express, { Application, NextFunction, Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import { apiLimiter } from "./middleware/rateLimiter";
import ExpressMongoSanitize from "express-mongo-sanitize";
import { logger } from "./common/utils/logger";

const app: Application = express();

//Security Middleware
app.set("trust proxy", 1);
app.use(helmet());
app.use(
  cors({
    origin: ["http://localhost:3000"],
  }),
);
app.use(apiLimiter);

//Body Parser Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(ExpressMongoSanitize());

// Routes
const catchAllHandler = (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    statusText: "fail",
    message: "The requested resource could not be found",
  });
  next();
};

app.all("*", catchAllHandler);

// Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.stack);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal Server Error" });
});

export default app;