import express from "express";
import * as adminController from "../controllers/adminController";
import * as manualScraperController from "../controllers/manualScraperController";

const router = express.Router();

const { runScrapers, streamLogs } = adminController;
const { uploadManualScrape, getManualScrapeStatus } = manualScraperController;

// POST /api/admin/run-scrapers
router.post("/run-scrapers", runScrapers);

// GET /api/admin/logs (Server-Sent Events for real-time log streaming)
router.get("/logs", streamLogs);

// POST /api/admin/manual-scrape (for manually scraped data)
router.post("/manual-scrape", uploadManualScrape);

// GET /api/admin/manual-scrape/status
router.get("/manual-scrape/status", getManualScrapeStatus);

export default router;
