import express, { Application, NextFunction, Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import { apiLimiter } from "./middleware/rateLimiter";
import ExpressMongoSanitize from "express-mongo-sanitize";
import { logger } from "./common/utils/logger";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import { ENVIRONMENT } from "./common/config/environment";

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
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
app.use(ExpressMongoSanitize());

// Routes
app.get("/api/v1", (req: Request, res: Response) => {
  res.status(200).json({
    statusText: "success",
    message: "Welcome to TechHiveMind API",
  });
});

// auth routes
app.use("/api/v1/auth", authRoutes);

// user routes
app.use("/api/v1/user", userRoutes);

const catchAllHandler = (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    statusText: "fail",
    message: "The requested resource could not be found",
  });
  next();
};

app.all("*", catchAllHandler);

// Error Handler
// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.stack);
  
  const statusCode = err.status || 500;
  const message = err.message || "Internal Server Error";
  
  res.status(statusCode).json({
    status: "error",
    message: message,
    ...(ENVIRONMENT.APP.ENV === "development" && { stack: err.stack }),
  });
});
// app.use((err: any, req: Request, res: Response, next: NextFunction) => {
//   logger.error(err.stack);
//   res
//     .status(err.status || 500)
//     .json({ error: err.message || "Internal Server Error" });
// });

export default app;
