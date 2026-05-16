import { ApiClient } from "./api/client";
import { API_CONFIG } from "./api/config";

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    isAdmin: boolean;
  };
}

export class AuthService {
  static async requestMagicLink(email: string): Promise<string> {
    const response = await ApiClient.post(
      API_CONFIG.ENDPOINTS.AUTH.MAGIC_LINK,
      { email },
      false
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to send login link");
    }

    const result = await response.json();
    return result.message;
  }

  static async verifyMagicLink(token: string): Promise<AuthResponse> {
    const response = await ApiClient.get(
      `${API_CONFIG.ENDPOINTS.AUTH.MAGIC_LINK_VERIFY}?token=${encodeURIComponent(token)}`,
      false
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Invalid or expired login link");
    }

    const authResponse: AuthResponse = await response.json();
    localStorage.setItem(API_CONFIG.STORAGE_KEYS.AUTH_TOKEN, authResponse.token);
    return authResponse;
  }

  static logout(): void {
    localStorage.removeItem(API_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
  }

  static getToken(): string | null {
    return localStorage.getItem(API_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  static getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return token
      ? { [API_CONFIG.AUTH.TOKEN_HEADER]: `${API_CONFIG.AUTH.TOKEN_PREFIX} ${token}` }
      : {};
  }

  static async validateToken(): Promise<boolean> {
    if (!this.getToken()) return false;
    try {
      const response = await ApiClient.get(API_CONFIG.ENDPOINTS.AUTH.VALIDATE, true);
      return response.ok;
    } catch {
      return false;
    }
  }
}
