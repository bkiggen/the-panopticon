import express from "express";
import * as adminController from "../controllers/adminController";

const router = express.Router();

const { runScrapers, streamLogs } = adminController;

// POST /api/admin/run-scrapers
router.post("/run-scrapers", runScrapers);

// GET /api/admin/logs (Server-Sent Events for real-time log streaming)
router.get("/logs", streamLogs);

export default router;
