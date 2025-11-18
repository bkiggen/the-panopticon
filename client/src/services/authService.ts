import { ApiClient } from "./api/client";
import { API_CONFIG } from "./api/config";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    isAdmin: boolean;
  };
}

export class AuthService {
  /**
   * Login admin user
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await ApiClient.post(
      API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      credentials,
      false
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Login failed");
    }

    const authResponse: AuthResponse = await response.json();

    // Store token in localStorage
    localStorage.setItem(
      API_CONFIG.STORAGE_KEYS.AUTH_TOKEN,
      authResponse.token
    );

    return authResponse;
  }

  /**
   * Logout user
   */
  static logout(): void {
    localStorage.removeItem(API_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
  }

  /**
   * Get stored token
   */
  static getToken(): string | null {
    return localStorage.getItem(API_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Get auth headers for API requests
   */
  static getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return token
      ? {
          [API_CONFIG.AUTH
            .TOKEN_HEADER]: `${API_CONFIG.AUTH.TOKEN_PREFIX} ${token}`,
        }
      : {};
  }

  /**
   * Validate current token
   */
  static async validateToken(): Promise<boolean> {
    const token = this.getToken();

    if (!token) return false;

    try {
      const response = await ApiClient.get(
        API_CONFIG.ENDPOINTS.AUTH.VALIDATE,
        true
      );

      return response.ok;
    } catch (error) {
      // Token validation failed - user will need to re-authenticate
      return false;
    }
  }
}
