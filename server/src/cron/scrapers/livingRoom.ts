import puppeteer from "puppeteer";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

class LivingRoomTheatersScraper {
  private baseUrl: string;
  public theatreName: string;

  constructor() {
    this.baseUrl = "https://pdx.livingroomtheaters.com/";
    this.theatreName = "Living Room Theaters";
  }

  // Parse date strings like "Sep 06" and convert to full date
  parseDate(monthDay: string): string | null {
    const currentYear = new Date().getFullYear();
    const [month, day] = monthDay.split(/\s+/);

    const monthMap: { [key: string]: string } = {
      Jan: "01",
      Feb: "02",
      Mar: "03",
      Apr: "04",
      May: "05",
      Jun: "06",
      Jul: "07",
      Aug: "08",
      Sep: "09",
      Oct: "10",
      Nov: "11",
      Dec: "12",
    };

    const monthNum = monthMap[month];
    const dayNum = day.padStart(2, "0");

    if (monthNum && dayNum) {
      return `${currentYear}-${monthNum}-${dayNum}`;
    }
    return null;
  }

  // Create a Date object from a date string without timezone issues
  // Avoids the bug where new Date("2025-11-18") interprets as UTC
  createDateObject(dateString: string): Date {
    const [year, month, day] = dateString.split("-");
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
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

      // Get all available dates from the carousel
      await page.goto(this.baseUrl, { waitUntil: "networkidle2" });
      await page.waitForSelector(
        ".lrtCarousel-dates-for-homepage-EntryWrapper",
        {
          timeout: 10000,
        }
      );

      const availableDates = await page.evaluate(() => {
        const dateElements = document.querySelectorAll(
          ".lrtCarousel-dates-for-homepage-EntryWrapper .lrtCarousel-dates-for-homepage-EntryTopRow-monthDateText"
        );
        const dates = Array.from(dateElements)
          .map((el) => el.textContent?.trim())
          .filter((text) => text && text !== "" && !text.includes("null"));

        // Remove duplicates and maintain order
        const uniqueDates = Array.from(new Set(dates));
        return uniqueDates.slice(0, 50); // Limit to 50 dates as requested
      });

      console.log(`Found ${availableDates.length} unique available dates`);

      const allEvents: any[] = [];
      const processedDates = new Set<string>();

      // Scrape each date
      for (const dateStr of availableDates) {
        if (!dateStr || processedDates.has(dateStr)) {
          continue; // Skip if already processed
        }

        console.log(`Scraping date: ${dateStr}`);

        // Click on the date to load its showtimes
        try {
          await page.evaluate((targetDate) => {
            const dateElements = document.querySelectorAll(
              ".lrtCarousel-dates-for-homepage-EntryWrapper"
            );

            for (const element of Array.from(dateElements)) {
              const monthDateEl = element.querySelector(
                ".lrtCarousel-dates-for-homepage-EntryTopRow-monthDateText"
              );
              if (monthDateEl?.textContent?.trim() === targetDate) {
                (element as HTMLElement).click();
                return true;
              }
            }
            return false;
          }, dateStr);

          // Wait for content to load
          await new Promise((resolve) => setTimeout(resolve, 2000));
          await page.waitForSelector("#movieListing", { timeout: 5000 });

          // Extract movie data for this date
          const moviesForDate = await page.evaluate(() => {
            const movies: any[] = [];
            const movieContainers = document.querySelectorAll(
              "#movieListing .movie"
            );

            movieContainers.forEach((movieEl) => {
              const titleEl = movieEl.querySelector(".movieTitleH2 a");
              const posterEl = movieEl.querySelector(
                ".poster img"
              ) as HTMLImageElement;

              if (!titleEl) return;

              const title = titleEl.textContent?.trim() || "";
              let posterUrl = "";

              // Extract poster URL from background-image style
              if (posterEl) {
                const style = posterEl.getAttribute("style") || "";
                const match = style.match(
                  /background-Image:\s*url\(['"]?([^'"]+)['"]?\)/
                );
                if (match) {
                  posterUrl = match[1].startsWith("/")
                    ? `https://pdx.livingroomtheaters.com${match[1]}`
                    : match[1];
                }
              }

              const showtimes: any[] = [];

              // Extract showtimes
              const timeElements = movieEl.querySelectorAll(
                ".lrtShowtimePillLink, .lrt-pill-inPast"
              );
              timeElements.forEach((timeEl) => {
                const time = timeEl.textContent?.trim() || "";
                const isPast = timeEl.classList.contains("lrt-pill-inPast");

                // Get discount info from the attribute element
                const pillWrapper = timeEl.closest(".lrtPillWrapper");
                const attributeEl = pillWrapper?.querySelector(".lrtAttribute");
                const attribute = attributeEl?.textContent?.trim() || "";

                if (time && !isPast) {
                  // Only include future showtimes
                  showtimes.push({
                    time,
                    attribute,
                    isPast,
                  });
                }
              });

              if (title && showtimes.length > 0) {
                movies.push({
                  title,
                  posterUrl,
                  showtimes,
                });
              }
            });

            return movies;
          });

          // Convert to database format
          const parsedDate = this.parseDate(dateStr);
          if (!parsedDate) continue;

          moviesForDate.forEach((movie) => {
            const times = movie.showtimes.map((s: any) => s.time);
            const discount: string[] = [];

            // Check for discounts
            movie.showtimes.forEach((show: any) => {
              if (show.attribute && show.attribute.includes("29% off")) {
                discount.push("29% off");
              }
            });

            allEvents.push({
              date: this.createDateObject(parsedDate),
              title: movie.title,
              originalTitle: movie.title,
              times,
              format: "Digital", // Default format for Living Room Theaters
              imageUrl: movie.posterUrl || "",
              theatre: this.theatreName,
              accessibility: [], // No accessibility info visible in the HTML
              discount: discount.length > 0 ? [...new Set(discount)] : [],
            });
          });
        } catch (error) {
          console.log(`Error scraping date ${dateStr}:`, error);
          continue;
        }
      }

      return allEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
    } catch (error: any) {
      throw new Error(
        `Failed to scrape Living Room Theaters: ${error.message}`
      );
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  async saveToDatabase(events: any[]) {
    // Delete existing Living Room Theaters events
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
      } catch (error: any) {
        console.error(`✗ Failed to save ${event.title}:`, {
          error: error.message,
          code: error.code,
          meta: error.meta,
        });
      }
    }

    return savedCount;
  }
}

// Run the scraper
async function run() {
  const scraper = new LivingRoomTheatersScraper();
  try {
    const movieData = await scraper.scrapeMovies();

    if (movieData.length > 0) {
      const savedCount = await scraper.saveToDatabase(movieData);

      console.log("\n📈 Summary:");
      console.log(`- Events scraped: ${movieData.length}`);
      console.log(`- Events saved: ${savedCount}`);
      console.log(`- Theatre: ${scraper.theatreName}`);
    } else {
      console.log("⚠️  No events found to save");
    }
  } catch (error: any) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
    console.log("\n🔌 Database connection closed");
  }
}

export { LivingRoomTheatersScraper };
export { run as runLivingRoomTheatersScraper };
