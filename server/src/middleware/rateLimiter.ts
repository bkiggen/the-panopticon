import rateLimit from "express-rate-limit";
import { Request, Response, NextFunction, RequestHandler } from "express";

// Wrapper that bypasses rate limiting entirely in test environment
const createTestableRateLimiter = (options: Parameters<typeof rateLimit>[0]): RequestHandler => {
  const limiter = rateLimit(options);
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip rate limiting entirely in test environment
    if (process.env.NODE_ENV === "test") {
      return next();
    }
    return limiter(req, res, next);
  };
};

export const authLimiter = createTestableRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: { error: "Too many login attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = createTestableRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: { error: "Too many requests. Please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});
