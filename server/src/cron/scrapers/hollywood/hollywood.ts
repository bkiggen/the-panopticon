import { Browser, Page } from "puppeteer";
import {
  BaseScraper,
  ScrapedMovieEvent,
  launchStealthBrowser,
  closeBrowser,
  generateDateRange,
  formatDateToString,
  respectRateLimit,
} from "../utils";

/**
 * Hollywood Theatre API response structure
 */
interface HollywoodEvent {
  id: number;
  title: string;
  start: string; // ISO date string
  end: string;
  url: string;
  image?: string;
  venue?: string;
  times?: string[];
  description?: string;
}

/**
 * Hollywood Theatre scraper
 * Uses WordPress REST API endpoint with Cloudflare bypass
 */
class HollywoodScraper extends BaseScraper {
  public readonly theatreName = "Hollywood Theatre";
  protected readonly baseUrl = "https://hollywoodtheatre.org";
  private readonly apiEndpoint =
    "https://hollywoodtheatre.org/wp-json/gecko-theme/v1/calendar-events";

  private browser: Browser | null = null;
  private page: Page | null = null;
  private daysToScrape: number = 90; // Default to 90 days

  /**
   * Set the number of days to scrape (default: 90)
   */
  setDaysToScrape(days: number): void {
    this.daysToScrape = days;
  }

  /**
   * Main scraping method
   */
  async scrapeMovies(): Promise<ScrapedMovieEvent[]> {
    try {
      const { browser, page } = await launchStealthBrowser();
      this.browser = browser;
      this.page = page;

      this.log("Bypassing Cloudflare...", "🛡️");

      // First, visit the showtimes page (which uses the API) to get past Cloudflare
      await page.goto(`${this.baseUrl}/showtimes/`, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      // Wait a bit longer to ensure all Cloudflare checks complete
      await new Promise((resolve) => setTimeout(resolve, 3000));

      this.log("Cloudflare bypass successful", "✅");

      // Generate date ranges for API requests (query in 7-day chunks)
      const allDates = generateDateRange(this.daysToScrape);
      const chunks: Array<{ start: Date; end: Date }> = [];

      for (let i = 0; i < allDates.length; i += 7) {
        const start = allDates[i];
        const end = allDates[Math.min(i + 6, allDates.length - 1)];
        chunks.push({ start, end });
      }

      this.log(
        `Fetching events in ${chunks.length} chunks (${this.daysToScrape} days total)...`,
        "📅"
      );

      const allEvents: ScrapedMovieEvent[] = [];

      for (let i = 0; i < chunks.length; i++) {
        const { start, end } = chunks[i];
        const startStr = formatDateToString(start);
        const endStr = formatDateToString(end);

        this.log(
          `Chunk ${i + 1}/${chunks.length}: ${startStr} to ${endStr}`,
          "📊"
        );

        const events = await this.fetchEventsFromAPI(startStr, endStr);
        allEvents.push(...events);

        // Respect rate limits between requests
        if (i < chunks.length - 1) {
          await respectRateLimit({ minSeconds: 1, maxSeconds: 2 });
        }
      }

      this.log(`Found ${allEvents.length} total events`, "✅");
      return this.sortEvents(allEvents);
    } finally {
      await closeBrowser(this.browser);
      this.browser = null;
      this.page = null;
    }
  }

  /**
   * Fetch events from the WordPress API for a date range
   */
  private async fetchEventsFromAPI(
    startDate: string,
    endDate: string
  ): Promise<ScrapedMovieEvent[]> {
    if (!this.page) {
      throw new Error("Browser page not initialized");
    }

    const url = `${this.apiEndpoint}?start_date=${startDate}&end_date=${endDate}&_locale=user`;

    try {
      // Navigate directly to the API URL (this works because we already have Cloudflare cookies)
      const response = await this.page.goto(url, {
        waitUntil: "networkidle0",
        timeout: 30000,
      });

      if (!response || !response.ok()) {
        // Check if it's a Cloudflare challenge page
        const pageContent = await this.page.content();
        if (pageContent.includes("cf_chl_opt") || pageContent.includes("challenge-platform")) {
          this.warn("Still being challenged by Cloudflare, waiting longer...");
          await new Promise((resolve) => setTimeout(resolve, 5000));
          // Retry once
          const retryResponse = await this.page.goto(url, {
            waitUntil: "networkidle0",
            timeout: 30000,
          });
          if (!retryResponse || !retryResponse.ok()) {
            throw new Error(`HTTP ${retryResponse?.status() || "unknown"} (after retry)`);
          }
        } else {
          throw new Error(`HTTP ${response?.status() || "unknown"}`);
        }
      }

      // Get the JSON response from the page
      const jsonText = await this.page.evaluate(() => {
        return document.body.textContent || "";
      });

      const apiEvents = JSON.parse(jsonText);
      const events = this.transformEvents(apiEvents);
      this.log(`  Found ${events.length} events`, "📽️");

      return events;
    } catch (error) {
      this.warn(
        `Error fetching ${startDate} to ${endDate}: ${(error as Error).message}`
      );
      return [];
    }
  }

  /**
   * Transform API response to ScrapedMovieEvent format
   */
  private transformEvents(apiEvents: HollywoodEvent[]): ScrapedMovieEvent[] {
    if (!Array.isArray(apiEvents)) {
      this.warn("API response is not an array");
      return [];
    }

    const results: ScrapedMovieEvent[] = [];

    for (const event of apiEvents) {
      try {
        // Parse the start date
        const eventDate = new Date(event.start);
        if (isNaN(eventDate.getTime())) {
          this.warn(`Invalid date for event: ${event.title}`);
          continue;
        }

        // Extract times if available, otherwise use start time
        const times = event.times && event.times.length > 0
          ? event.times.map((time) => ({ time }))
          : [{ time: this.formatTime(eventDate) }];

        // Clean title (remove "in 35mm", etc.)
        const cleanedTitle = this.cleanTitle(event.title);
        const format = this.detectFormat(event.title);

        results.push({
          date: eventDate,
          title: cleanedTitle,
          originalTitle: event.title,
          times,
          detailUrl: event.url || null,
          format,
          imageUrl: event.image || "",
          genres: [],
          theatre: this.theatreName,
          accessibility: [],
          discount: [],
          description: event.description || null,
        });
      } catch (error) {
        this.warn(
          `Error transforming event "${event.title}": ${(error as Error).message}`
        );
      }
    }

    return results;
  }

  /**
   * Clean movie title (remove format indicators)
   */
  private cleanTitle(title: string): string {
    return title
      .replace(/\s+in\s+(35mm|16mm|70mm)$/i, "")
      .replace(/\s+with\s+.+$/i, "")
      .trim();
  }

  /**
   * Detect film format from title
   */
  private detectFormat(title: string): string {
    if (/in\s+35mm/i.test(title)) return "35mm";
    if (/in\s+16mm/i.test(title)) return "16mm";
    if (/in\s+70mm/i.test(title)) return "70mm";
    return "Digital";
  }

  /**
   * Format a Date object as "HH:MM AM/PM"
   */
  private formatTime(date: Date): string {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, "0");
    return `${displayHours}:${displayMinutes} ${ampm}`;
  }

  /**
   * Sort events by date and title
   */
  private sortEvents(events: ScrapedMovieEvent[]): ScrapedMovieEvent[] {
    return events.sort((a, b) => {
      const dateCompare = a.date.getTime() - b.date.getTime();
      if (dateCompare !== 0) return dateCompare;
      return a.title.localeCompare(b.title);
    });
  }
}

// Create singleton instance
const scraper = new HollywoodScraper();

// Export for use by cron service
export async function runHollywoodScraper(): Promise<void> {
  await scraper.run();
}

// Export class for testing
export { HollywoodScraper };
