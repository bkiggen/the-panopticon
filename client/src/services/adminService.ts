const API_BASE = import.meta.env.PROD
  ? "/api" // Same domain in production
  : import.meta.env.VITE_API_URL || "http://localhost:3021/api";

export class AdminService {
  /**
   * Run all scrapers
   */
  static async runScrapers(scrapers?: string[]): Promise<void> {
    const response = await fetch(`${API_BASE}/admin/run-scrapers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ scrapers }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to run scrapers: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }
}
