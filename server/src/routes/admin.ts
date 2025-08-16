import express from "express";
import * as adminController from "../controllers/adminController";

const router = express.Router();

const { runScrapers } = adminController;

// GET /api/admin/run-scrapers
router.get("/run-scrapers", runScrapers);

export default router;
