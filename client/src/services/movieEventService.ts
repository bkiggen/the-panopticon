import { ApiClient } from "./api/client";
import { API_CONFIG } from "./api/config";

export class MovieEventService {
  /**
   * Get all movie events (public endpoint)
   */
  static async getAll(filters?: any): Promise<any> {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          if (Array.isArray(value)) {
            queryParams.append(key, value.join(","));
          } else {
            queryParams.append(key, String(value));
          }
        }
      });
    }

    const endpoint = `${API_CONFIG.ENDPOINTS.MOVIE_EVENTS.BASE}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    const response = await ApiClient.get(endpoint, false);

    if (!response.ok) {
      throw new Error(`Failed to fetch movie events: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get movie event by ID (public endpoint)
   */
  static async getById(id: number): Promise<any> {
    const response = await ApiClient.get(
      API_CONFIG.ENDPOINTS.MOVIE_EVENTS.BY_ID(id),
      false
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch movie event: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create a new movie event (requires admin auth)
   */
  static async create(data: any): Promise<any> {
    const response = await ApiClient.post(
      API_CONFIG.ENDPOINTS.MOVIE_EVENTS.BASE,
      data,
      true
    );

    if (!response.ok) {
      throw new Error(`Failed to create movie event: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create multiple movie events in bulk (requires admin auth)
   */
  static async createBulk(
    data: any[]
  ): Promise<{ message: string; count: number }> {
    const response = await ApiClient.post(
      API_CONFIG.ENDPOINTS.MOVIE_EVENTS.BULK,
      data,
      true
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to create movie events: ${response.status} ${
          response.statusText
        }. ${errorData.details || errorData.error || ""}`
      );
    }

    return response.json();
  }

  /**
   * Update movie event (requires admin auth)
   */
  static async update(id: number, data: any): Promise<any> {
    const response = await ApiClient.put(
      API_CONFIG.ENDPOINTS.MOVIE_EVENTS.BY_ID(id),
      data,
      true
    );

    if (!response.ok) {
      throw new Error(`Failed to update movie event: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Delete movie event (requires admin auth)
   */
  static async delete(id: number): Promise<void> {
    const response = await ApiClient.delete(
      API_CONFIG.ENDPOINTS.MOVIE_EVENTS.BY_ID(id),
      true
    );

    if (!response.ok) {
      throw new Error(`Failed to delete movie event: ${response.statusText}`);
    }
  }
}
