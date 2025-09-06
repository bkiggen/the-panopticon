import express from "express";
import * as adminController from "../controllers/adminController";

const router = express.Router();

const { runScrapers } = adminController;

// POST /api/admin/run-scrapers
router.post("/run-scrapers", runScrapers);

export default router;
