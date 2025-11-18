// @ts-nocheck
// Fandango Cinemagic Theatre Scraper
import puppeteer from "puppeteer";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

// Configuration - Change this to scrape more or fewer days
const DAYS_TO_SCRAPE = 5;

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const prisma = new PrismaClient();

class FandangoScraper {
  private baseUrl: string;
  public theatreName: string;

  constructor() {
    this.baseUrl =
      "https://www.fandango.com/cinemagic-theatre-aaijp/theater-page?format=all";
    this.theatreName = "Cinemagic";
  }

  // Helper function to parse time from Fandango format (e.g., "7:00p", "9:25p")
  parseTime(timeStr: string): [number, number] | null {
    // Handle formats like "7:00p", "9:25p", "12:00a", etc.
    const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})([ap])/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      const ampm = timeMatch[3].toLowerCase();

      if (ampm === "p" && hours !== 12) {
        hours += 12;
      } else if (ampm === "a" && hours === 12) {
        hours = 0;
      }

      return [hours, minutes];
    }
    return null;
  }

  // Helper function to parse movie info (rating and duration)
  parseMovieInfo(infoText: string): { rating?: string; duration?: string } {
    // Format: "R, 1 hr 45 min" or "PG-13, 2 hr 15 min"
    const parts = infoText.split(",").map((part) => part.trim());

    const result: { rating?: string; duration?: string } = {};

    if (parts.length >= 1) {
      result.rating = parts[0];
    }

    if (parts.length >= 2) {
      result.duration = parts[1];
    }

    return result;
  }

  // Navigate to a specific date by clicking the date picker button
  async selectDate(page: any, targetDate: string): Promise<boolean> {
    try {
      console.log(`📅 Selecting date: ${targetDate}`);

      // Look for the date button with the specific data-show-time-date attribute
      const dateButton = await page.$(
        `button[data-show-time-date="${targetDate}"]`
      );

      if (!dateButton) {
        console.warn(`Date button for ${targetDate} not found`);
        return false;
      }

      // Click the date button
      await dateButton.click();
      console.log(`Clicked date button for ${targetDate}`);

      // Wait for the page to update with new showtimes
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Wait for the movie list to be updated
      await page.waitForSelector(".thtr-mv-list", { timeout: 10000 });

      return true;
    } catch (error: any) {
      console.warn(`Error selecting date ${targetDate}:`, error.message);
      return false;
    }
  }

  // Scrape movie events for the currently selected date
  async scrapeDateEvents(page: any, currentDate: Date): Promise<any[]> {
    try {
      console.log(`🎬 Scraping events for ${currentDate.toDateString()}`);

      const rawData = await page.evaluate(() => {
        const events: any[] = [];
        const movieItems = document.querySelectorAll(
          ".thtr-mv-list .thtr-mv-list__panel"
        );

        movieItems.forEach((movieItem) => {
          // Extract movie title
          const titleElement = movieItem.querySelector(
            ".thtr-mv-list__detail-title a"
          );
          if (!titleElement) return;

          const title = titleElement.textContent?.trim() || "";

          // Extract movie poster image
          const posterElement = movieItem.querySelector(
            ".thtr-mv-list__detail-poster"
          );
          const imageUrl =
            posterElement?.style?.backgroundImage?.match(
              /url\(["']?([^"']*)["']?\)/
            )?.[1] || "";

          // Extract movie info (rating and duration)
          const infoElement = movieItem.querySelector(
            ".thtr-mv-list__info-bloc-item"
          );
          const infoText = infoElement?.textContent?.trim() || "";

          // Extract showtimes
          const showtimeButtons = movieItem.querySelectorAll(
            ".showtimes-btn-list__item a.showtime-btn"
          );
          const times: string[] = [];

          showtimeButtons.forEach((button) => {
            const timeText = button.textContent?.trim();
            if (timeText) {
              times.push(timeText);
            }
          });

          // Extract format/amenity info
          const formatElement = movieItem.querySelector(
            ".thtr-mv-list__showtimes-title"
          );
          const format = formatElement?.textContent?.trim() || "Standard";

          if (title && times.length > 0) {
            events.push({
              title,
              imageUrl,
              infoText,
              format,
              times,
            });
          }
        });

        return events;
      });

      // Transform to database format
      const events: any[] = [];

      rawData.forEach((movie) => {
        console.log(
          `🎭 ${
            movie.title
          } on ${currentDate.toDateString()}: ${movie.times.join(", ")}`
        );

        const movieInfo = this.parseMovieInfo(movie.infoText);

        movie.times.forEach((timeStr: string) => {
          const parsedTime = this.parseTime(timeStr);
          if (parsedTime) {
            const [hours, minutes] = parsedTime;

            // Create the event datetime
            const eventDateTime = new Date(currentDate.getTime());
            eventDateTime.setHours(hours, minutes, 0, 0);

            console.log(
              `🕒 Creating event: ${movie.title} at ${eventDateTime.toString()}`
            );

            events.push({
              date: eventDateTime,
              title: movie.title,
              originalTitle: movie.title,
              times: [timeStr],
              format: movie.format,
              imageUrl: movie.imageUrl || "",
              theatre: this.theatreName,
              accessibility: [], // Fandango doesn't clearly show accessibility info in this view
              discount: [],
              genres: [], // Would need to navigate to movie detail page for genres
              description: movieInfo.duration
                ? `${movieInfo.rating || ""} ${movieInfo.duration}`.trim()
                : null,
              trailerUrl: null,
              imdbId: null,
              rottenTomatoesId: null,
            });
          }
        });
      });

      return events;
    } catch (error: any) {
      console.error("Error scraping date events:", error.message);
      return [];
    }
  }

  async scrapeEvents(daysToScrape: number = DAYS_TO_SCRAPE) {
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      const page = await browser.newPage();
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      );

      console.log(`🎬 Scraping ${this.baseUrl}...`);
      await page.goto(this.baseUrl, { waitUntil: "networkidle2" });

      // Wait for the initial page to load
      await page.waitForSelector(".thtr-mv-list", { timeout: 15000 });
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const allEvents: any[] = [];
      const today = new Date();

      // Scrape today first (default page load)
      console.log("📅 Scraping today's events...");
      const todayEvents = await this.scrapeDateEvents(page, today);
      allEvents.push(...todayEvents);

      // Scrape subsequent days
      for (let i = 1; i < daysToScrape; i++) {
        try {
          const targetDate = new Date(today);
          targetDate.setDate(today.getDate() + i);

          // Format date as YYYY-MM-DD for Fandango
          const dateString =
            targetDate.getFullYear() +
            "-" +
            String(targetDate.getMonth() + 1).padStart(2, "0") +
            "-" +
            String(targetDate.getDate()).padStart(2, "0");

          console.log(
            `📅 Day ${i}: Selecting ${targetDate.toDateString()} (${dateString})`
          );

          const success = await this.selectDate(page, dateString);

          if (!success) {
            console.warn(`Failed to select ${dateString}, stopping scraping`);
            break;
          }

          // Scrape events for this date
          const dayEvents = await this.scrapeDateEvents(page, targetDate);
          allEvents.push(...dayEvents);
        } catch (error: any) {
          console.warn(`⚠️ Error scraping day ${i}:`, error.message);
        }
      }

      console.log(`📊 Found ${allEvents.length} total events`);
      return allEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
    } catch (error: any) {
      throw new Error(`Failed to scrape Fandango: ${error.message}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  async saveToDatabase(events: any[]) {
    // Delete existing events for this theatre
    await prisma.movieEvent.deleteMany({
      where: {
        theatre: this.theatreName,
      },
    });

    let savedCount = 0;

    for (const event of events) {
      try {
        await prisma.movieEvent.create({
          data: event,
        });
        savedCount++;
        console.log(
          `✓ Saved: ${
            event.title
          } on ${event.date.toLocaleDateString()} at ${event.times.join(", ")}`
        );
      } catch (error: any) {
        console.error(`✗ Failed to save ${event.title}:`, error.message);
      }
    }

    return savedCount;
  }
}

// Run the scraper
async function run() {
  const scraper = new FandangoScraper();

  try {
    console.log(`🎬 Starting Fandango scraper for ${DAYS_TO_SCRAPE} days...`);
    const events = await scraper.scrapeEvents(DAYS_TO_SCRAPE);

    if (events.length > 0) {
      const savedCount = await scraper.saveToDatabase(events);

      console.log("\n📈 Summary:");
      console.log(`- Events scraped: ${events.length}`);
      console.log(`- Events saved: ${savedCount}`);
      console.log(`- Theatre: ${scraper.theatreName}`);

      console.log("\n🎬 Events by Date:");
      const eventsByDate: { [key: string]: any[] } = {};

      events.forEach((event) => {
        const dateKey = event.date.toISOString().split("T")[0];
        if (!eventsByDate[dateKey]) {
          eventsByDate[dateKey] = [];
        }
        eventsByDate[dateKey].push(event);
      });

      Object.entries(eventsByDate).forEach(([date, dateEvents]) => {
        console.log(`📅 ${date}:`);
        dateEvents.forEach((event) => {
          console.log(`  - ${event.title} at ${event.times.join(", ")}`);
        });
      });
    } else {
      console.log("⚠️ No events found to save");
    }
  } catch (error: any) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
    console.log("\n🔌 Database connection closed");
  }
}

export { FandangoScraper };
export { run as runCinemagicScraper };
