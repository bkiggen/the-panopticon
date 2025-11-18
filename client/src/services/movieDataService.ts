// src/services/movieDataService.ts
import { ApiClient } from "./api/client";
import { API_CONFIG } from "./api/config";

export interface MovieDataFilters {
  search?: string;
  genres?: string[];
  hasImdbId?: boolean;
  hasRottenTomatoesId?: boolean;
}

export class MovieDataService {
  /**
   * Get all movie data (admin only)
   */
  static async getAll(
    filters?: MovieDataFilters,
    page?: number,
    limit?: number
  ): Promise<any> {
    const queryParams = new URLSearchParams();

    if (page) {
      queryParams.append("page", page.toString());
    }
    if (limit) {
      queryParams.append("limit", limit.toString());
    }

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            queryParams.append(key, value.join(","));
          } else {
            queryParams.append(key, String(value));
          }
        }
      });
    }

    const endpoint = `${
      API_CONFIG.ENDPOINTS.MOVIE_DATA?.BASE || "/api/admin/movie-data"
    }${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

    const response = await ApiClient.get(endpoint, true);

    if (!response.ok) {
      throw new Error(`Failed to fetch movie data: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get movie data by ID (admin only)
   */
  static async getById(id: number): Promise<any> {
    const endpoint = `${
      API_CONFIG.ENDPOINTS.MOVIE_DATA?.BY_ID(id) ||
      `/api/admin/movie-data/${id}`
    }`;

    const response = await ApiClient.get(endpoint, true);

    if (!response.ok) {
      throw new Error(`Failed to fetch movie data: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create new movie data (admin only)
   */
  static async create(data: any): Promise<any> {
    const endpoint =
      API_CONFIG.ENDPOINTS.MOVIE_DATA?.BASE || "/api/admin/movie-data";

    const response = await ApiClient.post(endpoint, data, true);

    if (!response.ok) {
      throw new Error(`Failed to create movie data: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Update movie data (admin only)
   */
  static async update(id: number, data: any): Promise<any> {
    const endpoint = `${
      API_CONFIG.ENDPOINTS.MOVIE_DATA?.BY_ID(id) ||
      `/api/admin/movie-data/${id}`
    }`;

    const response = await ApiClient.put(endpoint, data, true);

    if (!response.ok) {
      throw new Error(`Failed to update movie data: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Delete movie data (admin only)
   */
  static async delete(id: number): Promise<void> {
    const endpoint = `${
      API_CONFIG.ENDPOINTS.MOVIE_DATA?.BY_ID(id) ||
      `/api/admin/movie-data/${id}`
    }`;

    const response = await ApiClient.delete(endpoint, true);

    if (!response.ok) {
      throw new Error(`Failed to delete movie data: ${response.statusText}`);
    }
  }

  /**
   * Bulk delete movie data (admin only)
   */
  static async bulkDelete(ids: number[]): Promise<void> {
    const endpoint = `${
      API_CONFIG.ENDPOINTS.MOVIE_DATA?.BULK_DELETE ||
      "/api/admin/movie-data/bulk-delete"
    }`;

    const response = await ApiClient.post(endpoint, { ids }, true);

    if (!response.ok) {
      throw new Error(
        `Failed to bulk delete movie data: ${response.statusText}`
      );
    }
  }
}
