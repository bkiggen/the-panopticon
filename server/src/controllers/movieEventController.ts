import { Request, Response } from "express";
import * as movieEventService from "../services/movieEventService";

export const getMovieEvents = async (req: Request, res: Response) => {
  try {
    const movieEvents = await movieEventService.getAllMovieEvents();
    res.json(movieEvents);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch movie events" });
  }
};

export const getMovieEventById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const movieEvent = await movieEventService.getMovieEventById(id);

    if (!movieEvent) {
      return res.status(404).json({ error: "Movie event not found" });
    }

    res.json(movieEvent);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch movie event" });
  }
};

export const createMovieEvent = async (req: Request, res: Response) => {
  try {
    const movieEvent = await movieEventService.createMovieEvent(req.body);
    res.status(201).json(movieEvent);
  } catch (error) {
    res.status(400).json({ error: "Failed to create movie event" });
  }
};

export const updateMovieEvent = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const movieEvent = await movieEventService.updateMovieEvent(id, req.body);
    res.json(movieEvent);
  } catch (error) {
    res.status(400).json({ error: "Failed to update movie event" });
  }
};

export const deleteMovieEvent = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await movieEventService.deleteMovieEvent(id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: "Failed to delete movie event" });
  }
};
