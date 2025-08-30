import express from "express";
import * as movieEventController from "../controllers/movieEventController";
import { adminAuth } from "../middleware/auth";

const router = express.Router();

// GET /api/movie-events
router.get("/", movieEventController.getMovieEvents);

// GET /api/movie-events/:id
router.get("/:id", movieEventController.getMovieEventById);

// POST /api/movie-events
router.post("/", adminAuth, movieEventController.createMovieEvent);

// POST /api/movie-events/bulk
router.post("/bulk", movieEventController.createMovieEvents);

// PUT /api/movie-events/:id
router.put("/:id", adminAuth, movieEventController.updateMovieEvent);

// DELETE /api/movie-events/:id
router.delete("/:id", adminAuth, movieEventController.deleteMovieEvent);

export default router;
