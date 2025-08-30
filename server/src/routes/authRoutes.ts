import express from "express";
import * as authController from "../controllers/authController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// Public auth routes
router.post("/login", authController.login);

// Protected routes
router.get("/validate", authenticateToken, authController.validateToken);

// Admin creation route (you might want to remove this in production or add extra security)
router.post("/create-admin", authController.createAdmin);

export default router;
