import { Browser, Page } from "puppeteer";
import {
  BaseScraper,
  ScrapedMovieEvent,
  launchStealthBrowser,
  closeBrowser,
  detectBotProtection,
  generateDateRange,
  formatDateToString,
  randomDelay,
  respectRateLimit,
} from "./utils";

/**
 * Raw movie data extracted from the page
 */
interface RawMovieData {
  title: string;
  originalTitle: string;
  posterUrl: string;
  duration: string;
  times: string[];
  ticketUrls: string[];
  detailUrl: string;
  hasSpecialScreening: boolean;
}

/**
 * Academy Theater scraper
 * Uses stealth browser and human-like behavior
 * New site structure: React/Next.js app with date-based filtering
 */
class AcademyScraper extends BaseScraper {
  public readonly theatreName = "Academy Theater";
  protected readonly baseUrl = "https://www.academytheaterpdx.com/movies";

  private browser: Browser | null = null;
  private page: Page | null = null;

  /**
   * Main scraping method
   */
  async scrapeMovies(): Promise<ScrapedMovieEvent[]> {
    try {
      const { browser, page } = await launchStealthBrowser();
      this.browser = browser;
      this.page = page;

      const dates = generateDateRange(90); // 3 months of dates
      const allEvents: ScrapedMovieEvent[] = [];

      this.log(`Starting scrape for ${dates.length} dates...`, "🎭");

      for (let i = 0; i < dates.length; i++) {
        const date = dates[i];
        const dateStr = formatDateToString(date);
        this.log(`Processing date ${i + 1}/${dates.length}: ${dateStr}`, "📅");

        const events = await this.scrapeDatePage(date, dateStr);
        allEvents.push(...events);

        // Respect rate limits between page loads
        if (i < dates.length - 1) {
          this.log(
            "Pausing before next date (respecting rate limits)...",
            "⏳",
          );
          await respectRateLimit({ minSeconds: 3, maxSeconds: 6 });
        }
      }

      return this.sortEvents(allEvents);
    } finally {
      await closeBrowser(this.browser);
      this.browser = null;
      this.page = null;
    }
  }

  /**
   * Scrape a single date page
   */
  private async scrapeDatePage(
    date: Date,
    dateStr: string,
  ): Promise<ScrapedMovieEvent[]> {
    if (!this.page) {
      throw new Error("Browser page not initialized");
    }

    const url = `${this.baseUrl}/?date=${dateStr}`;
    this.log(`Navigating to: ${url}`, "🔗");

    try {
      await this.page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

      // Wait for React to hydrate and render content
      this.log("Waiting for React to render...", "⏳");
      await randomDelay(3000, 5000);

      // Check for bot protection
      const isCaptcha = await detectBotProtection(this.page);
      if (isCaptcha) {
        this.warn(`CAPTCHA detected for ${dateStr} - skipping`);
        return [];
      }

      // Wait for movie content to appear
      const hasContent = await this.waitForMovieContent();
      if (!hasContent) {
        this.warn(`No movie content found for ${dateStr}`);
        return [];
      }

      // Extract movie data
      const rawMovies = await this.extractMovieData();
      this.log(`Found ${rawMovies.length} movies for ${dateStr}`, "✅");

      // Transform to ScrapedMovieEvent format
      return rawMovies.map((movie) => this.transformMovie(movie, date));
    } catch (error) {
      this.warn(
        `Error loading page for ${dateStr}: ${(error as Error).message}`,
      );
      return [];
    }
  }

  /**
   * Check if page is still in loading state
   */
  private async checkIfStillLoading(): Promise<boolean> {
    if (!this.page) return false;

    return this.page.evaluate(() => {
      const bodyText = document.body.innerText.toLowerCase();
      return (
        bodyText.includes("establishing") ||
        bodyText.includes("secure connection") ||
        bodyText.includes("loading") ||
        document.body.innerText.length < 500
      );
    });
  }

  /**
   * Check if movie content is present on the page
   */
  private async checkForContent(): Promise<boolean> {
    if (!this.page) return false;

    return this.page.evaluate(() => {
      // New React structure uses css-oviv6j class for movie containers
      return document.querySelectorAll(".css-oviv6j").length > 0;
    });
  }

  /**
   * Wait for movie content to appear (with retry logic)
   */
  private async waitForMovieContent(): Promise<boolean> {
    if (!this.page) return false;

    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const isLoading = await this.checkIfStillLoading();
      if (!isLoading) {
        const hasContent = await this.checkForContent();
        if (hasContent) {
          this.log("Movie content detected", "✅");
          return true;
        }
      }

      this.log(
        `Waiting for content... (attempt ${attempts + 1}/${maxAttempts})`,
        "⏳",
      );
      await randomDelay(1000, 2000);
      attempts++;
    }

    return false;
  }

  /**
   * Extract raw movie data from the page
   */
  private async extractMovieData(): Promise<RawMovieData[]> {
    if (!this.page) return [];

    return this.page.evaluate(() => {
      const movies: RawMovieData[] = [];

      // New React structure uses css-oviv6j class for movie containers
      const movieContainers = document.querySelectorAll(".css-oviv6j");

      movieContainers.forEach((container) => {
        // Extract title and detail URL from the movie link
        const titleLink = container.querySelector(
          "a[href^='/movies/']",
        ) as HTMLAnchorElement;
        if (!titleLink) return;

        // Try to get title from multiple sources
        const titleEl = titleLink.querySelector(".css-1gu884c");
        const title =
          titleEl?.textContent?.trim() ||
          titleLink.getAttribute("title") ||
          titleLink.textContent?.trim() ||
          "";
        if (!title) return;

        // Build full detail URL
        const detailPath = titleLink.getAttribute("href") || "";
        const detailUrl = detailPath
          ? `https://www.academytheaterpdx.com${detailPath}`
          : "";

        // Extract poster image
        const posterEl = titleLink.querySelector("img") as HTMLImageElement;
        const posterUrl = posterEl?.src || "";

        // Extract showtimes with ticket URLs
        const times: Array<{ time: string; ticketUrl?: string }> = [];
        const showtimeLinks = container.querySelectorAll(
          "a[href^='https://booking.academytheaterpdx.com/']",
        ) as NodeListOf<HTMLAnchorElement>;

        showtimeLinks.forEach((link) => {
          const timeText = link.textContent?.trim() || "";
          const ticketUrl = link.href;

          if (timeText && ticketUrl) {
            times.push({
              time: timeText,
              ticketUrl: ticketUrl,
            });
          }
        });

        // Only add if we have showtimes
        if (title && times.length > 0) {
          movies.push({
            title,
            originalTitle: title,
            posterUrl,
            duration: "", // Duration not readily available in new structure
            times: times.map((t) => t.time), // Keep string array for backwards compatibility
            hasSpecialScreening: false, // Not indicated in new structure
            detailUrl,
            ticketUrls: times.map((t) => t.ticketUrl || ""),
          });
        }
      });

      return movies;
    });
  }

  /**
   * Transform raw movie data to ScrapedMovieEvent format
   */
  private transformMovie(movie: RawMovieData, date: Date): ScrapedMovieEvent {
    const discount: string[] = [];

    if (movie.hasSpecialScreening) {
      discount.push("Special Screening");
    }

    // Build Showtime array pairing times with ticket URLs
    const times = movie.times.map((time, index) => ({
      time,
      ticketUrl: movie.ticketUrls[index] || undefined,
    }));

    return {
      date,
      title: movie.title,
      originalTitle: movie.originalTitle,
      times,
      detailUrl: movie.detailUrl || null,
      format: "Digital",
      imageUrl: movie.posterUrl,
      genres: [],
      theatre: this.theatreName,
      accessibility: [],
      discount,
    };
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
const scraper = new AcademyScraper();

// Export for use by cron service
export async function runAcademyScraper(): Promise<void> {
  await scraper.run();
}

// Export class for testing
export { AcademyScraper };
