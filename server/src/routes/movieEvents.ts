import express from "express";
import * as movieEventController from "../controllers/movieEventController";

const router = express.Router();

// GET /api/movie-events
router.get("/", movieEventController.getMovieEvents);

// GET /api/movie-events/:id
router.get("/:id", movieEventController.getMovieEventById);

// POST /api/movie-events
router.post("/", movieEventController.createMovieEvent);

// PUT /api/movie-events/:id
router.put("/:id", movieEventController.updateMovieEvent);

// DELETE /api/movie-events/:id
router.delete("/:id", movieEventController.deleteMovieEvent);

export default router;
