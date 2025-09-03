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

class TomorrowTheaterScraper {
  constructor() {
    this.baseUrl = "https://tomorrowtheater.org/coming-soon/";
    this.theatreName = "Tomorrow Theater";
  }

  parseDateText(dateText) {
    // e.g., "Today,  Aug 3" → "2025-08-03"
    const now = new Date();
    const [, monthStr, dayStr] =
      dateText.match(/,\s+([A-Za-z]+)\s+(\d{1,2})/) || [];
    const monthMap = {
      January: "01",
      February: "02",
      March: "03",
      April: "04",
      May: "05",
      June: "06",
      July: "07",
      August: "08",
      September: "09",
      October: "10",
      November: "11",
      December: "12",
    };
    const month = monthMap[monthStr];
    const day = dayStr?.padStart(2, "0");
    return month && day ? `${now.getFullYear()}-${month}-${day}` : null;
  }

  async scrapeMovies() {
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
      const page = await browser.newPage();

      console.log("Navigating to Tomorrow Theater...");
      await page.goto(this.baseUrl, { waitUntil: "domcontentloaded" });
      await page.waitForSelector("#main", { timeout: 10000 });
      await new Promise((resolve) => setTimeout(resolve, 5000));
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); // force lazy load
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await new Promise((resolve) => setTimeout(resolve, 3000));

      console.log("Waiting for .show-details...");
      await page.waitForSelector(".show-list", {
        timeout: 10000,
      });

      const html = await page.content();

      const rawData = await page.evaluate(() => {
        const shows = [];
        const showElements = document.querySelectorAll(
          ".show-list .show-details"
        );

        showElements.forEach((showEl) => {
          const titleEl = showEl.querySelector(".show-title .title");
          const imageEl = showEl.querySelector(".show-poster img");
          const runtimeEl = showEl.querySelector(".show-specs");
          const descriptionEl = showEl.querySelector(".show-content");
          const tagEls = showEl.querySelectorAll(".pill");
          const showTimesEl = showEl.querySelectorAll(".showtimes .showtime");

          // Get the date from the data-date attribute (Unix timestamp)
          const dateElement = showEl.querySelector(".show-date[data-date]");
          const unixTimestamp = dateElement?.getAttribute("data-date");

          const title = titleEl?.textContent.trim() ?? null;
          const url = titleEl?.href ?? null;
          const imageUrl = imageEl?.src ?? null;
          const runtimeMatch = runtimeEl?.textContent.match(
            /Event Runtime:\s*(\d+)\s*min/i
          );
          const runtime = runtimeMatch ? `${runtimeMatch[1]} min` : null;
          const description = descriptionEl?.textContent.trim() ?? null;
          const tags = Array.from(tagEls).map((p) => p.textContent.trim());

          shows.push({
            title,
            url,
            imageUrl,
            runtime,
            description,
            unixTimestamp: unixTimestamp ? parseInt(unixTimestamp) : null, // Add this
            showtimes: Array.from(showTimesEl).map((el) =>
              el.textContent.trim()
            ),
            tags,
          });
        });
        return shows;
      });
      // Post-process into flat events like in your Cinema21 format
      const events = [];
      for (const show of rawData) {
        console.log("🚀 ~ TomorrowTheaterScraper ~ scrapeMovies ~ show:", show);

        // Convert Unix timestamp to proper date
        const eventDate = show.unixTimestamp
          ? new Date(show.unixTimestamp * 1000) // Unix timestamps are in seconds, JS needs milliseconds
          : new Date(); // fallback to today

        events.push({
          date: eventDate,
          title: show.title,
          originalTitle: show.title,
          times: show.showtimes,
          format: "Digital",
          imageUrl: show.imageUrl || "",
          ariaLabel: "",
          theatre: this.theatreName,
          accessibility: show.tags.includes("Open Captions")
            ? ["Open Captions"]
            : [],
        });
      }
      return events;
    } catch (error) {
      throw new Error(`Failed to scrape Tomorrow Theater: ${error.message}`);
    } finally {
      if (browser) await browser.close();
    }
  }

  async saveToDatabase(events: any[]) {
    // First, delete existing Cinema 21 events to avoid duplicates
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
  const scraper = new TomorrowTheaterScraper();
  try {
    console.log("Scraping Tomorrow Theater movie listings...");
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

export { TomorrowTheaterScraper, run as runTomorrowTheaterScraper };
