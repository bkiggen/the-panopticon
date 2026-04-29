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
} from "../utils";

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
  private daysToScrape: number = 90; // Default to 90 days (3 months)

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

      const dates = generateDateRange(this.daysToScrape);
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

      // Handle cookie consent dialog if present
      await this.dismissCookieConsent();

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
   * Dismiss cookie consent dialog if present
   */
  private async dismissCookieConsent(): Promise<void> {
    if (!this.page) return;

    try {
      // Look for common cookie consent button text patterns
      const dismissed = await this.page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll("button"));
        const agreeButton = buttons.find(
          (btn) =>
            btn.textContent?.toLowerCase().includes("agree") ||
            btn.textContent?.toLowerCase().includes("accept") ||
            btn.textContent?.toLowerCase().includes("close"),
        );

        if (agreeButton) {
          (agreeButton as HTMLButtonElement).click();
          return true;
        }
        return false;
      });

      if (dismissed) {
        this.log("Dismissed cookie consent dialog", "🍪");
        await randomDelay(1000, 2000);
      }
    } catch (error) {
      // Ignore errors - cookie dialog might not be present
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
      // Use stable selector: movie links or booking links
      const movieLinks = document.querySelectorAll("a[href^='/movies/']");
      const bookingLinks = document.querySelectorAll("a[href^='https://booking.academytheaterpdx.com/']");
      return movieLinks.length > 0 || bookingLinks.length > 0;
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
   * Uses stable selectors (href patterns, semantic elements) instead of generated CSS classes
   */
  private async extractMovieData(): Promise<RawMovieData[]> {
    if (!this.page) return [];

    return this.page.evaluate(() => {
      const movies: RawMovieData[] = [];
      const processedMovies = new Set<string>();

      // Find all movie links (stable selector)
      const movieLinks = document.querySelectorAll("a[href^='/movies/']") as NodeListOf<HTMLAnchorElement>;

      movieLinks.forEach((movieLink) => {
        // Get title from stable attributes
        const title =
          movieLink.getAttribute("title")?.trim() ||
          movieLink.querySelector("img")?.getAttribute("alt")?.trim() ||
          "";

        if (!title || processedMovies.has(title)) return;

        // Build full detail URL
        const detailPath = movieLink.getAttribute("href") || "";
        const detailUrl = detailPath
          ? `https://www.academytheaterpdx.com${detailPath}`
          : "";

        // Extract poster image
        const posterEl = movieLink.querySelector("img") as HTMLImageElement;
        const posterUrl = posterEl?.src || "";

        // Find the nearest common ancestor that contains both movie info and showtimes
        // Walk up the DOM to find a container that has booking links
        let container = movieLink.parentElement;
        let showtimeLinks: NodeListOf<HTMLAnchorElement> | null = null;
        let maxLevels = 10; // Prevent infinite loop

        while (container && maxLevels > 0) {
          const links = container.querySelectorAll(
            "a[href^='https://booking.academytheaterpdx.com/']"
          ) as NodeListOf<HTMLAnchorElement>;

          if (links.length > 0) {
            showtimeLinks = links;
            break;
          }

          container = container.parentElement;
          maxLevels--;
        }

        // Extract showtimes with ticket URLs
        const times: Array<{ time: string; ticketUrl?: string }> = [];

        if (showtimeLinks) {
          showtimeLinks.forEach((link) => {
            // Get time from aria-label (most reliable) or from time element
            const ariaLabel = link.getAttribute("aria-label")?.trim();
            const timeEl = link.querySelector("time");
            const timeText = ariaLabel || timeEl?.textContent?.trim() || "";
            const ticketUrl = link.href;

            if (timeText && ticketUrl) {
              times.push({
                time: timeText,
                ticketUrl: ticketUrl,
              });
            }
          });
        }

        // Only add if we have showtimes
        if (title && times.length > 0) {
          processedMovies.add(title);
          movies.push({
            title,
            originalTitle: title,
            posterUrl,
            duration: "",
            times: times.map((t) => t.time),
            hasSpecialScreening: false,
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
