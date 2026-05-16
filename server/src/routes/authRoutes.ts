import express from "express";
import * as authController from "../controllers/authController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

router.post("/magic-link", authController.requestMagicLink);
router.get("/magic-link/verify", authController.verifyMagicLink);
router.get("/validate", authenticateToken, authController.validateToken);

export default router;
