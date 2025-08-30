import { API_CONFIG } from "./config";
import { AuthService } from "../authService";
import useSessionStore from "../../stores/sessionStore";

class ApiClient {
  private static handleAuthError() {
    AuthService.logout();
    useSessionStore.getState().clearSession();
    // Optionally redirect to login or show a message
    window.location.href = "/auth";
  }

  static async fetch(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    // Ensure Content-Type is set for requests with body
    const mergedOptions = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    const response = await fetch(url, mergedOptions);

    // Handle auth errors globally
    if (response.status === 401 || response.status === 403) {
      this.handleAuthError();
      throw new Error("Session expired. Please log in again.");
    }

    return response;
  }

  // Convenience method for authenticated requests
  static async authenticatedFetch(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const authHeaders = AuthService.getAuthHeaders();

    const mergedOptions: RequestInit = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
        ...options.headers,
      },
    };

    return ApiClient.fetch(url, mergedOptions);
  }

  // Convenience methods for common HTTP verbs with full URL building
  static async get(endpoint: string, authenticated = false): Promise<Response> {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const fetchMethod = authenticated
      ? ApiClient.authenticatedFetch
      : ApiClient.fetch;
    return fetchMethod(url, { method: "GET" });
  }

  static async post(
    endpoint: string,
    data?: any,
    authenticated = false
  ): Promise<Response> {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const fetchMethod = authenticated
      ? ApiClient.authenticatedFetch
      : ApiClient.fetch;
    return fetchMethod(url, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static async put(
    endpoint: string,
    data?: any,
    authenticated = false
  ): Promise<Response> {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const fetchMethod = authenticated
      ? ApiClient.authenticatedFetch
      : ApiClient.fetch;
    return fetchMethod(url, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static async delete(
    endpoint: string,
    authenticated = false
  ): Promise<Response> {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const fetchMethod = authenticated
      ? ApiClient.authenticatedFetch
      : ApiClient.fetch;
    return fetchMethod(url, { method: "DELETE" });
  }
}

export { ApiClient };
