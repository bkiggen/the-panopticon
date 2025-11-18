import express from "express";
import rateLimit from "express-rate-limit";
import * as authController from "../controllers/authController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// Rate limiter for login attempts - prevents brute force attacks
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  message: "Too many login attempts, please try again after 15 minutes",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Public auth routes
router.post("/login", loginLimiter, authController.login);

// Protected routes
router.get("/validate", authenticateToken, authController.validateToken);

// router.post("/create-admin", authController.createAdmin);

export default router;
