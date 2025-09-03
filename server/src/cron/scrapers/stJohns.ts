// @ts-nocheck
import puppeteer from "puppeteer";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const prisma = new PrismaClient();

class StJohnsCinemaScraper {
  constructor() {
    this.baseUrl = "https://www.stjohnscinema.com/now-playing/";
    this.theatreName = "St. Johns Cinema";
  }

  parseDateString(dateString) {
    // Parse dates like "Wednesday, September 3" or "Thursday, September 4"
    const now = new Date();
    const currentYear = now.getFullYear();

    // Extract month and day from string
    const match = dateString.match(/([A-Za-z]+),\s+([A-Za-z]+)\s+(\d{1,2})/);
    if (!match) return null;

    const [, , monthStr, dayStr] = match;

    const monthMap = {
      January: 0,
      February: 1,
      March: 2,
      April: 3,
      May: 4,
      June: 5,
      July: 6,
      August: 7,
      September: 8,
      October: 9,
      November: 10,
      December: 11,
    };

    const month = monthMap[monthStr];
    const day = parseInt(dayStr);

    if (month === undefined || isNaN(day)) return null;

    // Create date - assume current year, but check if date has passed
    let eventDate = new Date(currentYear, month, day);

    // If the date is in the past, assume it's next year
    if (eventDate < now) {
      eventDate = new Date(currentYear + 1, month, day);
    }

    return eventDate;
  }

  async scrapeMovies() {
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      const page = await browser.newPage();
      console.log("Navigating to St. Johns Cinema...");
      await page.goto(this.baseUrl, { waitUntil: "domcontentloaded" });

      // Wait for the main content to load
      await page.waitForSelector(".veezi-film-panel", { timeout: 10000 });
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const rawData = await page.evaluate(() => {
        const movies = [];
        const filmPanels = document.querySelectorAll(".veezi-film-panel");

        filmPanels.forEach((panel) => {
          // Get basic movie info
          const titleEl = panel.querySelector(".veezi-film-info h3");
          const imageEl = panel.querySelector(".veezi-film-media img");
          const descriptionEl = panel.querySelector(
            ".veezi-film-info .hidden-xs"
          );
          const ratingEl = panel.querySelector(".veezi-film-rated");

          const title = titleEl?.textContent.trim() || null;
          const imageUrl = imageEl?.src || null;
          const description = descriptionEl?.textContent.trim() || null;
          const rating =
            ratingEl?.textContent.replace("Rated:", "").trim() || null;

          // Get all showtimes grouped by date
          const datePanels = panel.querySelectorAll(".veezi-date-panel");
          const showtimes = [];

          datePanels.forEach((datePanel) => {
            const dateText = datePanel
              .querySelector(".veezi-date")
              ?.textContent.trim();
            const timeLinks = datePanel.querySelectorAll(".showtimes a");

            const times = Array.from(timeLinks).map((link) =>
              link.textContent.trim()
            );

            if (dateText && times.length > 0) {
              showtimes.push({
                date: dateText,
                times: times,
              });
            }
          });

          if (title && showtimes.length > 0) {
            movies.push({
              title,
              imageUrl,
              description,
              rating,
              showtimes,
            });
          }
        });

        return movies;
      });

      // Convert to flat events format
      const events = [];
      for (const movie of rawData) {
        console.log(`Processing movie: ${movie.title}`);

        for (const showtime of movie.showtimes) {
          const eventDate = this.parseDateString(showtime.date);

          if (eventDate) {
            events.push({
              date: eventDate,
              title: movie.title,
              originalTitle: movie.title,
              times: showtime.times,
              format: "Digital", // Assuming digital format
              imageUrl: movie.imageUrl || "",
              ariaLabel: "",
              theatre: this.theatreName,
              description: movie.description,
              accessibility: [], // No accessibility info visible in this format
              discount: [],
              genres: [], // No genre info visible
            });
          }
        }
      }

      return events;
    } catch (error) {
      throw new Error(`Failed to scrape St. Johns Cinema: ${error.message}`);
    } finally {
      if (browser) await browser.close();
    }
  }

  async saveToDatabase(events) {
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
      } catch (error) {
        console.error(`Failed to save ${event.title}:`, {
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
  const scraper = new StJohnsCinemaScraper();
  try {
    console.log("Scraping St. Johns Cinema movie listings...");
    const movieData = await scraper.scrapeMovies();

    if (movieData.length > 0) {
      const savedCount = await scraper.saveToDatabase(movieData);

      console.log("\nSummary:");
      console.log(`- Events scraped: ${movieData.length}`);
      console.log(`- Events saved: ${savedCount}`);
      console.log(`- Theatre: ${scraper.theatreName}`);
    } else {
      console.log("No events found to save");
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

export { StJohnsCinemaScraper, run as runStJohnsCinemaScraper };
