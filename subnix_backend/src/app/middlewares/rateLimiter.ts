import rateLimit from "express-rate-limit";
import { Request } from "express";

// Strict rate limiter for project submissions to prevent spam
export const submissionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 5,                   // Maximum 5 project submissions per hour per user/IP
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,          // Disables IPv6 key generator warning
  keyGenerator: (req: Request) => {
    return req.user?.id || req.ip || "unknown-client";
  },
  message: {
    success: false,
    statusCode: 429,
    message: "Rate limit exceeded: You can only submit up to 5 projects per hour to prevent spam.",
  },
});
