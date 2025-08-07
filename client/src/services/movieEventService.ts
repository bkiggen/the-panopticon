// src/services/movieEventService.ts
import type { MovieEvent } from "@prismaTypes";

const API_BASE = import.meta.env.PROD
  ? "/api" // Same domain in production
  : import.meta.env.VITE_API_URL || "http://localhost:3021/api";

export interface MovieEventFilters {
  theatre?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

/**
 * Pure API service - no state management, just HTTP calls
 */
export class MovieEventService {
  /**
   * Get all movie events with optional filters
   */
  static async getAll(filters: MovieEventFilters = {}): Promise<MovieEvent[]> {
    const params = new URLSearchParams();

    if (filters.theatre) params.append("theatre", filters.theatre);
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.search) params.append("search", filters.search);

    const url = `${API_BASE}/movie-events${
      params.toString() ? `?${params.toString()}` : ""
    }`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch movie events: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  /**
   * Get a single movie event by ID
   */
  static async getById(id: number): Promise<MovieEvent> {
    const response = await fetch(`${API_BASE}/movie-events/${id}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Movie event not found");
      }
      throw new Error(
        `Failed to fetch movie event: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  /**
   * Create a new movie event
   */
  static async create(
    data: Omit<MovieEvent, "id" | "createdAt" | "updatedAt">
  ): Promise<MovieEvent> {
    const response = await fetch(`${API_BASE}/movie-events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to create movie event: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  /**
   * Update a movie event
   */
  static async update(
    id: number,
    data: Partial<MovieEvent>
  ): Promise<MovieEvent> {
    const response = await fetch(`${API_BASE}/movie-events/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to update movie event: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  /**
   * Delete a movie event
   */
  static async delete(id: number): Promise<void> {
    const response = await fetch(`${API_BASE}/movie-events/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(
        `Failed to delete movie event: ${response.status} ${response.statusText}`
      );
    }
  }
}
