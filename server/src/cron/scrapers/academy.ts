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
  simulateReading,
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
  hasSpecialScreening: boolean;
}

/**
 * Academy Theater scraper
 * Uses stealth browser and human-like behavior due to Squarespace bot protection
 */
class AcademyScraper extends BaseScraper {
  public readonly theatreName = "Academy Theater";
  protected readonly baseUrl = "https://academytheaterpdx.com/now-playing";

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

      const dates = generateDateRange(7);
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
          this.log("Pausing before next date (respecting rate limits)...", "⏳");
          await respectRateLimit({ minSeconds: 8, maxSeconds: 15 });
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
    dateStr: string
  ): Promise<ScrapedMovieEvent[]> {
    if (!this.page) {
      throw new Error("Browser page not initialized");
    }

    const url = `${this.baseUrl}?date=${dateStr}`;
    this.log(`Navigating to: ${url}`, "🔗");

    try {
      await this.page.goto(url, { waitUntil: "domcontentloaded" });

      // Wait for Squarespace/bot protection to finish
      this.log("Waiting for page to fully load...", "⏳");
      await randomDelay(5000, 8000);

      // Check if page needs more time
      const needsMoreTime = await this.checkIfStillLoading();
      if (needsMoreTime) {
        this.log("Page still loading, waiting longer...", "🔄");
        await randomDelay(8000, 12000);
      }

      // Check for CAPTCHA
      const isCaptcha = await detectBotProtection(this.page);
      if (isCaptcha) {
        this.warn(`CAPTCHA detected for ${dateStr} - skipping`);
        return [];
      }

      // Check if content is available
      const hasContent = await this.checkForContent();
      if (!hasContent) {
        this.warn(`No movie content found for ${dateStr}`);

        // Try waiting a bit more
        await randomDelay(3000, 5000);
        const hasContentAfterWait = await this.checkForContent();
        if (!hasContentAfterWait) {
          this.warn(`Still no content after wait, skipping ${dateStr}`);
          return [];
        }
      }

      // Simulate human reading behavior
      await simulateReading(this.page);

      // Extract movie data
      const rawMovies = await this.extractMovieData();
      this.log(`Found ${rawMovies.length} movies for ${dateStr}`, "✅");

      // Transform to ScrapedMovieEvent format
      return rawMovies.map((movie) => this.transformMovie(movie, date));
    } catch (error) {
      this.warn(`Error loading page for ${dateStr}: ${(error as Error).message}`);
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
      return document.querySelectorAll(".col-md-12.col-lg-6").length > 0;
    });
  }

  /**
   * Extract raw movie data from the page
   */
  private async extractMovieData(): Promise<RawMovieData[]> {
    if (!this.page) return [];

    return this.page.evaluate(() => {
      const movies: RawMovieData[] = [];

      const movieContainers = document.querySelectorAll(".col-md-12.col-lg-6");

      movieContainers.forEach((container) => {
        const movieContainer = container.querySelector(".at-np-container");
        if (!movieContainer) return;

        const titleEl = movieContainer.querySelector("h2 a");
        if (!titleEl) return;

        const title = titleEl.textContent?.trim() || "";

        const posterEl = movieContainer.querySelector("img");
        const posterUrl = posterEl?.src || "";

        const durationEl = movieContainer.querySelector(".at-dur .at-content");
        const duration = durationEl?.textContent?.trim() || "";

        // Extract showtimes
        const times: string[] = [];
        const timesContainer = movieContainer.querySelector(".at-np-details-times");
        if (timesContainer) {
          const timeElements = timesContainer.querySelectorAll("ul li span:first-child");
          timeElements.forEach((timeEl) => {
            const text = timeEl.textContent?.trim() || "";
            if (text.match(/\d{1,2}:\d{2}\s*(AM|PM)/i)) {
              times.push(text);
            }
          });
        }

        const hasSpecial = !!movieContainer.querySelector(".signs .fas.fa-star");

        if (title && times.length > 0) {
          movies.push({
            title,
            originalTitle: title,
            posterUrl,
            duration,
            times,
            hasSpecialScreening: hasSpecial,
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

    return {
      date,
      title: movie.title,
      originalTitle: movie.originalTitle,
      times: movie.times,
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
