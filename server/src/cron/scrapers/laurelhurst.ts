// @ts-nocheck
import puppeteer from "puppeteer";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

// Load environment variables
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const prisma = new PrismaClient();

class LaurelhurstScraper {
  constructor() {
    this.baseUrl = "https://www.laurelhursttheater.com";
    this.theatreName = "Laurelhurst Theater";
  }

  // Convert date string like "20250803" to "2025-08-03"
  formatDate(dateString) {
    if (dateString.length === 8) {
      const year = dateString.substring(0, 4);
      const month = dateString.substring(4, 6);
      const day = dateString.substring(6, 8);
      return `${year}-${month}-${day}`;
    }
    return null;
  }

  // Extract duration from rating/time string like "PG13 - 90min"
  extractDuration(ratingTimeString) {
    const match = ratingTimeString?.match(/(\d+)min/);
    return match ? `${match[1]} min` : "";
  }

  // Extract rating from rating/time string like "PG13 - 90min"
  extractRating(ratingTimeString) {
    const parts = ratingTimeString?.split(" - ");
    return parts ? parts[0] : "Not Rated";
  }

  // Clean movie title to remove accessibility suffixes
  cleanTitle(title) {
    return title.replace(/\s*\(open caption\)$/i, "").trim();
  }

  // Decode HTML entities in URLs
  decodeHtmlEntities(str) {
    if (!str) return str;
    return str
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }

  // Check if movie has open captions
  hasOpenCaptions(title) {
    return /\(open caption\)$/i.test(title);
  }

  async scrapeMovies() {
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      const page = await browser.newPage();
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      );

      console.log("Navigating to Laurelhurst Theater...");
      await page.goto(this.baseUrl, { waitUntil: "networkidle2" });

      // Wait for the movie data to be loaded
      await page.waitForFunction(() => window.gbl_movies && window.gbl_dates, {
        timeout: 10000,
      });

      // Extract the global movie and date data from the page
      const { movieData, dateData } = await page.evaluate(() => {
        return {
          movieData: window.gbl_movies,
          dateData: window.gbl_dates,
        };
      });

      // Transform to flat array format matching Cinema 21 structure
      const events = [];

      // Process each movie
      Object.entries(movieData).forEach(([movieId, movie]) => {
        const cleanedTitle = this.cleanTitle(movie.title);
        const hasAccessibility = this.hasOpenCaptions(movie.title);

        // Process each date that has showtimes for this movie
        Object.entries(movie.schedule).forEach(([dateKey, showtimes]) => {
          const formattedDate = this.formatDate(dateKey);
          if (!formattedDate) return;

          const times = showtimes.map((showtime) => showtime.timeStr);

          // Build accessibility array
          const accessibility = [];
          if (hasAccessibility) {
            accessibility.push("Open Captions");
          }

          // Extract rating and duration
          const ratingTime = `${movie.rating} - ${movie.lengthMin}min`;
          const rating = this.extractRating(ratingTime);
          const duration = this.extractDuration(ratingTime);

          events.push({
            date: new Date(formattedDate),
            title: cleanedTitle,
            originalTitle: movie.title,
            times,
            format: "Digital",
            imageUrl: this.decodeHtmlEntities(movie.posterURL) || "",
            theatre: this.theatreName,
            accessibility: accessibility.length > 0 ? accessibility : [],
            discount: [],
          });
        });
      });

      // Sort events by date and then by title
      return events.sort((a, b) => {
        const dateCompare = a.date.getTime() - b.date.getTime();
        if (dateCompare !== 0) return dateCompare;
        return a.title.localeCompare(b.title);
      });
    } catch (error) {
      throw new Error(`Failed to scrape Laurelhurst Theater: ${error.message}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  async saveToDatabase(events: any[]) {
    await prisma.movieEvent.deleteMany({
      where: {
        theatre: this.theatreName,
      },
    });

    // Save new events
    let savedCount = 0;
    for (const event of events) {
      try {
        await prisma.movieEvent.create({
          data: event,
        });
        savedCount++;
      } catch (error: any) {
        console.error(`✗ Failed to save ${event.title}:`, {
          error: error.message,
          code: error.code,
          meta: error.meta,
          eventData: JSON.stringify(event, null, 2),
        });
      }
    }

    return savedCount;
  }
}

// Run the scraper
async function run() {
  const scraper = new LaurelhurstScraper();
  try {
    console.log("Scraping Laurelhurst Theater movie listings...");
    const movieData = await scraper.scrapeMovies();
    if (movieData.length > 0) {
      // Save to database
      const savedCount = await scraper.saveToDatabase(movieData);
      // Show summary
      console.log("\n📈 Summary:");
      console.log(`- Events scraped: ${movieData.length}`);
      console.log(`- Events saved: ${savedCount}`);
      console.log(`- Theatre: ${scraper.theatreName}`);
    } else {
      console.log("⚠️  No events found to save");
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

export { LaurelhurstScraper, run as runLaurelhurstScraper };
