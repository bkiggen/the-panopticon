import ical, { VEvent } from "node-ical";
import { BaseScraper, ScrapedMovieEvent } from "./utils";

/**
 * Clinton Street Theater scraper
 * Uses iCalendar feed for event data
 */
class ClintonStreetScraper extends BaseScraper {
  public readonly theatreName = "Clinton Street Theater";
  protected readonly baseUrl = "https://cstpdx.com";
  private readonly icsUrl =
    "https://cstpdx.com/?post_type=tribe_events&ical=1&eventDisplay=list";

  /**
   * Main scraping method
   */
  async scrapeMovies(): Promise<ScrapedMovieEvent[]> {
    this.log("Starting scrape from iCalendar feed...", "🎭");

    try {
      // Fetch and parse the iCalendar feed
      this.log(`Fetching calendar from: ${this.icsUrl}`, "🔗");
      const events = await ical.async.fromURL(this.icsUrl);

      const scrapedEvents: ScrapedMovieEvent[] = [];
      const now = new Date();
      const threeMonthsFromNow = new Date();
      threeMonthsFromNow.setDate(now.getDate() + 90);

      // Process each event in the calendar
      for (const event of Object.values(events)) {
        if (!event || event.type !== "VEVENT") continue;
        const vevent = event as VEvent;

        // Skip events without start date
        if (!vevent.start) continue;

        // Skip events outside our date range (next 90 days)
        const eventDate = new Date(vevent.start);
        if (eventDate < now || eventDate > threeMonthsFromNow) {
          continue;
        }

        const scrapedEvent = this.transformEvent(vevent);
        if (scrapedEvent) {
          scrapedEvents.push(scrapedEvent);
        }
      }

      this.log(`Found ${scrapedEvents.length} events`, "✅");
      return this.sortEvents(scrapedEvents);
    } catch (error) {
      this.warn(`Error scraping calendar: ${(error as Error).message}`);
      return [];
    }
  }

  /**
   * Transform iCalendar event to ScrapedMovieEvent format
   */
  private transformEvent(event: VEvent): ScrapedMovieEvent | null {
    try {
      const title = event.summary || "";
      if (!title || !event.start) return null;

      const startDate = new Date(event.start);

      // Format time as "HH:MM AM/PM"
      const formatTime = (date: Date): string => {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? "PM" : "AM";
        const displayHours = hours % 12 || 12;
        const displayMinutes = minutes.toString().padStart(2, "0");
        return `${displayHours}:${displayMinutes} ${ampm}`;
      };

      const showtime = formatTime(startDate);

      // Extract detail URL
      const detailUrl = event.url || null;

      // Extract poster image from attachments
      let imageUrl = "";
      if (event.attach) {
        if (typeof event.attach === "string") {
          imageUrl = event.attach;
        } else if (typeof event.attach === "object" && "val" in event.attach) {
          imageUrl = event.attach.val as string;
        } else if (Array.isArray(event.attach) && event.attach.length > 0) {
          const firstAttach = event.attach[0];
          imageUrl = typeof firstAttach === "string" ? firstAttach : "";
        }
      }

      // Extract categories/genres
      let genres: string[] = [];
      if (event.categories) {
        if (typeof event.categories === "string") {
          genres = [event.categories];
        } else if (typeof event.categories === "object" && "val" in event.categories) {
          genres = [event.categories.val as string];
        } else if (Array.isArray(event.categories)) {
          genres = event.categories.filter(Boolean) as string[];
        }
      }

      // Extract description (clean up escape characters)
      let description: string | null = null;
      if (event.description) {
        const desc = typeof event.description === "string"
          ? event.description
          : typeof event.description === "object" && "val" in event.description
          ? (event.description.val as string)
          : "";
        description = desc.replace(/\\n/g, "\n").replace(/\\,/g, ",").trim() || null;
      }

      // Handle title properly (it might be a ParameterValue)
      const eventTitle = typeof title === "string"
        ? title
        : typeof title === "object" && "val" in title
        ? (title.val as string)
        : String(title);

      return {
        date: startDate,
        title: eventTitle,
        originalTitle: eventTitle,
        times: [{ time: showtime }],
        detailUrl,
        format: "Digital",
        imageUrl,
        genres: genres.filter(Boolean),
        description,
        theatre: this.theatreName,
        accessibility: [],
        discount: [],
      };
    } catch (error) {
      this.warn(
        `Error transforming event "${event.summary}": ${(error as Error).message}`,
      );
      return null;
    }
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
const scraper = new ClintonStreetScraper();

// Export for use by cron service
export async function runCSTScraper(): Promise<void> {
  await scraper.run();
}

// Export class for testing
export { ClintonStreetScraper };
