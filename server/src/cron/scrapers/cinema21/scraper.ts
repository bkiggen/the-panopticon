import { Browser, Page } from "puppeteer";
import {
  BaseScraper,
  ScrapedMovieEvent,
  Showtime,
  launchBrowser,
  closeBrowser,
  createDateFromString,
  parseMonthDay,
  formatDateToString,
} from "../utils";

/**
 * Raw showtime data from the page
 */
interface RawShowtime {
  date: string;
  time: string;
  attribute: string;
  ticketUrl: string;
}

/**
 * Raw movie data from the page
 */
interface RawMovieData {
  title: string;
  duration: string;
  posterUrl: string;
  detailUrl: string;
  showtimes: RawShowtime[];
}

/**
 * Cinema 21 scraper
 * Scrapes movie listings from cinema21.com
 */
class Cinema21Scraper extends BaseScraper {
  public readonly theatreName = "Cinema 21";
  protected readonly baseUrl = "https://www.cinema21.com";

  /**
   * Parse date strings like "Today | August 01" or "Saturday | August 02"
   */
  private parseShowtimeDate(dateString: string): Date | null {
    if (dateString.includes("Today")) {
      const today = new Date();
      today.setHours(12, 0, 0, 0);
      return today;
    }

    // Extract month and day from strings like "Saturday | August 02"
    const parts = dateString.split("|");
    if (parts.length === 2) {
      const monthDay = parts[1].trim();
      const match = monthDay.match(/(\w+)\s+(\d+)/);
      if (match) {
        return parseMonthDay(match[1], match[2]);
      }
    }

    return null;
  }

  /**
   * Main scraping method
   */
  async scrapeMovies(): Promise<ScrapedMovieEvent[]> {
    let browser: Browser | null = null;

    try {
      const result = await launchBrowser();
      browser = result.browser;
      const page = result.page;

      this.log(`Navigating to ${this.baseUrl}...`, "🔗");
      await page.goto(this.baseUrl, { waitUntil: "networkidle2", timeout: 60000 });

      await page.waitForSelector(".times-tickets-single-movie", {
        timeout: 30000,
      });

      this.log("Extracting movie data...", "📊");
      const rawData = await this.extractRawData(page);
      this.log(`Found ${rawData.length} movies`, "✅");

      // Transform to database format
      return this.transformToEvents(rawData);
    } catch (error) {
      throw new Error(`Failed to scrape Cinema 21: ${(error as Error).message}`);
    } finally {
      await closeBrowser(browser);
    }
  }

  /**
   * Extract raw movie data from the page
   */
  private async extractRawData(page: Page): Promise<RawMovieData[]> {
    // Note: Code inside page.evaluate runs in browser context, no TypeScript types
    return page.evaluate(() => {
      const movies: Array<{
        title: string;
        duration: string;
        posterUrl: string;
        detailUrl: string;
        showtimes: Array<{ date: string; time: string; attribute: string; ticketUrl: string }>;
      }> = [];

      const movieContainers = document.querySelectorAll(
        ".times-tickets-single-movie:not(.hidden-print .times-tickets-single-movie)"
      );

      movieContainers.forEach((movieEl) => {
        const titleEl = movieEl.querySelector(
          ".times-tickets-single-movie__heading"
        );
        const durationEl = movieEl.querySelector(
          ".times-tickets-single-movie__duration"
        );
        const posterEl = movieEl.querySelector(
          ".movie-poster"
        ) as HTMLImageElement;
        const detailLinkEl = movieEl.querySelector(
          ".times-tickets-single-movie__link"
        ) as HTMLAnchorElement;

        if (!titleEl) return;

        const title = titleEl.textContent?.trim() || "";
        const duration = durationEl?.textContent?.trim() || "";
        const posterUrl = posterEl?.src || "";
        const detailUrl = detailLinkEl?.href || "";

        const showtimes: Array<{ date: string; time: string; attribute: string; ticketUrl: string }> = [];

        // Helper to extract showtimes from session elements
        const extractShowtimes = (sessionEl: Element) => {
          const dateEl = sessionEl.querySelector(".single-session__date");
          if (!dateEl) return;

          const date = dateEl.textContent?.trim() || "";
          const timeSlots = sessionEl.querySelectorAll(".time-slot");

          timeSlots.forEach((slotEl) => {
            const timeEl = slotEl.querySelector(".time-slot__time");
            const attributeEl = slotEl.querySelector(".time-slot__attribute");
            const linkEl = slotEl.querySelector(
              ".time-slot__link"
            ) as HTMLAnchorElement;

            if (!timeEl) return;

            const time = timeEl.textContent?.trim() || "";
            const attribute = attributeEl?.textContent?.trim() || "";
            const ticketUrl = linkEl?.href || "";

            showtimes.push({ date, time, attribute, ticketUrl });
          });
        };

        // Regular sessions
        movieEl
          .querySelectorAll(".single-session")
          .forEach(extractShowtimes);

        // Hidden sessions
        movieEl
          .querySelectorAll(".hidden-sessions__wrapper .single-session")
          .forEach(extractShowtimes);

        if (title && showtimes.length > 0) {
          movies.push({ title, duration, posterUrl, detailUrl, showtimes });
        }
      });

      return movies;
    });
  }

  /**
   * Transform raw movie data to ScrapedMovieEvent format
   */
  private transformToEvents(rawData: RawMovieData[]): ScrapedMovieEvent[] {
    const events: ScrapedMovieEvent[] = [];

    rawData.forEach((movie) => {
      // Group showtimes by date
      const showsByDate = new Map<string, RawShowtime[]>();

      movie.showtimes.forEach((show) => {
        const parsedDate = this.parseShowtimeDate(show.date);
        if (!parsedDate) return;

        const dateKey = formatDateToString(parsedDate);
        if (!showsByDate.has(dateKey)) {
          showsByDate.set(dateKey, []);
        }
        showsByDate.get(dateKey)!.push(show);
      });

      // Create event entries for each date
      showsByDate.forEach((shows, dateStr) => {
        // Build Showtime objects with time and ticketUrl paired
        const times: Showtime[] = shows.map((show) => ({
          time: show.time,
          ticketUrl: show.ticketUrl,
        }));

        const accessibilitySet = new Set<string>();
        const discountSet = new Set<string>();

        // Parse attributes for accessibility and discounts
        shows.forEach((show) => {
          if (show.attribute) {
            if (show.attribute.includes("OPEN CAPS")) {
              accessibilitySet.add("Open Captions");
            }
            if (show.attribute.includes("EARLY BIRD")) {
              discountSet.add("Early Bird Pricing");
            }
          }
        });

        events.push({
          date: createDateFromString(dateStr),
          title: movie.title,
          originalTitle: movie.title,
          times,
          detailUrl: movie.detailUrl || null,
          format: "Digital",
          imageUrl: movie.posterUrl || "",
          theatre: this.theatreName,
          accessibility: Array.from(accessibilitySet),
          discount: Array.from(discountSet),
          genres: [],
        });
      });
    });

    // Sort events by date
    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  }
}

// Create singleton instance
const scraper = new Cinema21Scraper();

// Export for use by cron service
export async function runCinema21Scraper(): Promise<void> {
  await scraper.run();
}

// Export class for testing
export { Cinema21Scraper };
