// src/services/movieEventService.ts
import type { MovieEvent } from "@prismaTypes";

const API_BASE = import.meta.env.PROD
  ? "/api" // Same domain in production
  : import.meta.env.VITE_API_URL || "http://localhost:3021/api";
export interface MovieEventFilters {
  search?: string;
  theatres?: string[];
  formats?: string[];
  accessibility?: string[];
  discounts?: string[];
  startDate?: string;
  endDate?: string;
  timeFilter?: string;
}
/**
 * Pure API service - no state management, just HTTP calls
 */
export class MovieEventService {
  /**
   * Get all movie events with optional filters
   */
  static async getAll(
    filters: MovieEventFilters = {},
    page: number = 1,
    limit: number = 10
  ): Promise<{ events: MovieEvent[]; total: number; totalPages: number }> {
    const params = new URLSearchParams();

    // Add all filter parameters
    if (filters.search) params.append("search", filters.search);
    if (filters.theatres?.length)
      params.append("theatres", filters.theatres.join(","));
    if (filters.formats?.length)
      params.append("formats", filters.formats.join(","));
    if (filters.accessibility?.length)
      params.append("accessibility", filters.accessibility.join(","));
    if (filters.discounts?.length)
      params.append("discounts", filters.discounts.join(","));
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.timeFilter) params.append("timeFilter", filters.timeFilter);

    // Add pagination parameters
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    const url = `${API_BASE}/movie-events?${params.toString()}`;
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
