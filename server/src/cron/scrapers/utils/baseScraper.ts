/**
 * Base scraper class with shared functionality
 * All theatre scrapers should extend this class
 */
import { prisma } from "../../../lib/prisma";

/**
 * Movie event data structure for scrapers
 * Matches the Prisma MovieEvent model fields needed for creation
 */
export interface ScrapedMovieEvent {
  date: Date;
  title: string;
  originalTitle: string;
  times: string[];
  format: string;
  imageUrl: string;
  genres?: string[];
  description?: string | null;
  trailerUrl?: string | null;
  imdbId?: string | null;
  rottenTomatoesId?: string | null;
  theatre: string;
  accessibility: string[];
  discount: string[];
}

/**
 * Options for the scraper run
 */
export interface ScraperRunOptions {
  dryRun?: boolean; // If true, don't save to database
  verbose?: boolean; // If true, print detailed logs
}

/**
 * Result of a scraper run
 */
export interface ScraperRunResult {
  eventsScraped: number;
  eventsSaved: number;
  theatreName: string;
  errors: string[];
}

/**
 * Abstract base class for theatre scrapers
 * Provides common functionality for database operations and logging
 */
export abstract class BaseScraper {
  public abstract readonly theatreName: string;
  protected abstract readonly baseUrl: string;

  /**
   * Abstract method that subclasses must implement
   * Should scrape movie events from the theatre's website
   */
  abstract scrapeMovies(): Promise<ScrapedMovieEvent[]>;

  /**
   * Save scraped events to the database
   * Deletes existing events for this theatre first to avoid duplicates
   */
  async saveToDatabase(events: ScrapedMovieEvent[]): Promise<number> {
    // Delete existing events for this theatre
    await prisma.movieEvent.deleteMany({
      where: {
        theatre: this.theatreName,
      },
    });

    // Save new events
    let savedCount = 0;
    const errors: string[] = [];

    for (const event of events) {
      try {
        await prisma.movieEvent.create({
          data: {
            date: event.date,
            title: event.title,
            originalTitle: event.originalTitle,
            times: event.times,
            format: event.format,
            imageUrl: event.imageUrl,
            genres: event.genres || [],
            description: event.description,
            trailerUrl: event.trailerUrl,
            imdbId: event.imdbId,
            rottenTomatoesId: event.rottenTomatoesId,
            theatre: event.theatre,
            accessibility: event.accessibility,
            discount: event.discount,
            scrapedAt: new Date(),
          },
        });
        savedCount++;
      } catch (error) {
        const err = error as Error & { code?: string; meta?: unknown };
        const errorMsg = `Failed to save "${event.title}": ${err.message}`;
        errors.push(errorMsg);
        console.error(`✗ ${errorMsg}`, {
          code: err.code,
          meta: err.meta,
        });
      }
    }

    if (errors.length > 0) {
      console.warn(`⚠️  ${errors.length} events failed to save`);
    }

    return savedCount;
  }

  /**
   * Run the scraper with standard logging and error handling
   */
  async run(options: ScraperRunOptions = {}): Promise<ScraperRunResult> {
    const { dryRun = false, verbose = false } = options;
    const result: ScraperRunResult = {
      eventsScraped: 0,
      eventsSaved: 0,
      theatreName: this.theatreName,
      errors: [],
    };

    try {
      console.log(`🎬 Starting ${this.theatreName} scraper...`);

      const events = await this.scrapeMovies();
      result.eventsScraped = events.length;

      if (events.length === 0) {
        console.log("⚠️  No events found to save");
        return result;
      }

      console.log(`📊 Found ${events.length} events`);

      if (verbose) {
        console.log("\n🎬 Sample Events:");
        events.slice(0, 3).forEach((event) => {
          console.log(
            `  - ${event.title} on ${event.date.toLocaleDateString()} at ${event.times.join(", ")}`
          );
        });
      }

      if (dryRun) {
        console.log("🔍 Dry run - not saving to database");
        console.log("\n--- SAMPLE DATA ---");
        console.log(JSON.stringify(events.slice(0, 2), null, 2));
      } else {
        const savedCount = await this.saveToDatabase(events);
        result.eventsSaved = savedCount;

        console.log("\n📈 Summary:");
        console.log(`  - Events scraped: ${events.length}`);
        console.log(`  - Events saved: ${savedCount}`);
        console.log(`  - Theatre: ${this.theatreName}`);
      }
    } catch (error) {
      const errorMsg = (error as Error).message;
      result.errors.push(errorMsg);
      console.error(`💥 Error: ${errorMsg}`);
    }

    console.log(`\n✅ ${this.theatreName} scraper completed`);
    return result;
  }

  /**
   * Helper to log progress during scraping
   */
  protected log(message: string, emoji = "📝"): void {
    console.log(`${emoji} [${this.theatreName}] ${message}`);
  }

  /**
   * Helper to log warnings
   */
  protected warn(message: string): void {
    console.warn(`⚠️  [${this.theatreName}] ${message}`);
  }

  /**
   * Helper to log errors
   */
  protected error(message: string): void {
    console.error(`❌ [${this.theatreName}] ${message}`);
  }
}
