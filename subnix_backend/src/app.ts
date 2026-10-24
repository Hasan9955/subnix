import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import router from "./app/routes";
import prisma from "./app/lib/prisma";

const app: Application = express();

// CORS configuration allowing Next.js frontend on localhost and Vercel
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) return callback(null, true);
    if (
      origin.includes("localhost") ||
      origin.includes("127.0.0.1") ||
      origin.endsWith(".vercel.app") ||
      origin === process.env.CLIENT_URL
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// Global rate limiter to prevent general API abuse
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  message: {
    success: false,
    statusCode: 429,
    message: "Too many requests from this IP, please try again after 15 minutes.",
  },
});

// Middleware setup
app.use(cors(corsOptions));
app.use(globalLimiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Health check endpoint
app.get("/", (req: Request, res: Response) => {
  res.status(httpStatus.OK).json({
    success: true,
    message: "Subnix Project Submission & Review API is running smoothly.",
    version: "1.0.0",
  });
});

app.get("/health", async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(httpStatus.OK).json({
      success: true,
      database: "Connected to PostgreSQL",
      status: "Healthy",
    });
  } catch (error: any) {
    res.status(httpStatus.SERVICE_UNAVAILABLE).json({
      success: false,
      database: "Database connection failed",
      error: error.message,
    });
  }
});

// API Routes
app.use("/api/v1", router);

// Global Error Handler
app.use(globalErrorHandler);

// 404 Route Handler
app.use((req: Request, res: Response) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "API endpoint not found",
    error: {
      path: req.originalUrl,
      message: `The requested path ${req.originalUrl} does not exist on this server.`,
    },
  });
});

export default app;
