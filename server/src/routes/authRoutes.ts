import express from "express";
import * as authController from "../controllers/authController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// Note: Rate limiting is handled via authLimiter from middleware/rateLimiter.ts
// which automatically skips rate limiting in test environment

// Public auth routes (rate limiting applied in app.ts)
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

// Protected routes
router.get("/validate", authenticateToken, authController.validateToken);

// router.post("/create-admin", authController.createAdmin);

export default router;
