import express, { Application, NextFunction, Request, Response } from "express";
import { ENVIRONMENT } from "./common/config/environment";
import helmet from "helmet";
import cors from "cors";
import { apiLimiter } from "./middleware/rateLimiter";
import ExpressMongoSanitize from "express-mongo-sanitize";
import { logger } from "./common/utils/logger";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import productRoutes from "./routes/product.routes";  

const app: Application = express();

//Security Middleware
app.set("trust proxy", 1);
app.use(helmet());
app.use(
  cors({
    origin: ["http://localhost:3000","http://127.0.0.1:5500"],
  }),
);
app.use(apiLimiter);

//Body Parser Middlewares
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
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

// product routes
app.use("/api/v1/product", productRoutes);


const catchAllHandler = (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    statusText: "fail",
    message: "The requested resource could not be found",
  });
  next();
};

app.all("*", catchAllHandler);


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


export default app;
