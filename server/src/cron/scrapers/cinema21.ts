import puppeteer from "puppeteer";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

class Cinema21Scraper {
  private baseUrl: string;
  public theatreName: string;

  constructor() {
    this.baseUrl = "https://www.cinema21.com";
    this.theatreName = "Cinema 21";
  }

  // Helper function to parse date strings like "Today | August 01" or "Saturday | August 02"
  parseDate(dateString: string): string | null {
    const currentYear = new Date().getFullYear();

    if (dateString.includes("Today")) {
      const today = new Date();
      return today.toISOString().split("T")[0];
    }

    // Extract month and day from strings like "Saturday | August 02"
    const parts = dateString.split("|");
    if (parts.length === 2) {
      const monthDay = parts[1].trim();
      const [month, day] = monthDay.split(" ");

      const monthMap: { [key: string]: string } = {
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

      const monthNum = monthMap[month];
      const dayNum = day.padStart(2, "0");

      if (monthNum && dayNum) {
        return `${currentYear}-${monthNum}-${dayNum}`;
      }
    }

    return null;
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

      console.log("Navigating to Cinema 21...");
      await page.goto(this.baseUrl, { waitUntil: "networkidle2" });

      await page.waitForSelector(".times-tickets-single-movie", {
        timeout: 10000,
      });

      const rawData = await page.evaluate(() => {
        const movies: any[] = [];
        const movieContainers = document.querySelectorAll(
          ".times-tickets-single-movie:not(.hidden-print .times-tickets-single-movie)"
        );

        movieContainers.forEach((movieEl) => {
          const titleEl = movieEl.querySelector(
            ".times-tickets-single-movie__heading"
          );
          const ratingEl = movieEl.querySelector(
            ".times-tickets-single-movie__classification-rating"
          );
          const durationEl = movieEl.querySelector(
            ".times-tickets-single-movie__duration"
          );
          const posterEl = movieEl.querySelector(
            ".movie-poster"
          ) as HTMLImageElement;
          const linkEl = movieEl.querySelector(
            ".times-tickets-single-movie__link"
          ) as HTMLAnchorElement;

          if (!titleEl) return;

          const title = titleEl.textContent?.trim() || "";
          const rating = ratingEl?.textContent?.trim() || "Not Rated";
          const duration = durationEl?.textContent?.trim() || "";
          const posterUrl = posterEl?.src || "";
          const movieUrl = linkEl?.href || "";

          const showtimes: any[] = [];

          // Regular sessions
          const sessionElements = movieEl.querySelectorAll(".single-session");
          sessionElements.forEach((sessionEl) => {
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

              showtimes.push({
                date,
                time,
                attribute,
                ticketUrl,
              });
            });
          });

          // Hidden sessions
          const hiddenSessions = movieEl.querySelectorAll(
            ".hidden-sessions__wrapper .single-session"
          );
          hiddenSessions.forEach((sessionEl) => {
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

              showtimes.push({
                date,
                time,
                attribute,
                ticketUrl,
              });
            });
          });

          if (title && showtimes.length > 0) {
            movies.push({
              title,
              rating,
              duration,
              posterUrl,
              movieUrl,
              showtimes,
            });
          }
        });

        return movies;
      });

      // Transform to database format
      const events: any[] = [];
      rawData.forEach((movie) => {
        // Group showtimes by date
        const showsByDate: { [key: string]: any[] } = {};
        movie.showtimes.forEach((show: any) => {
          const parsedDate = this.parseDate(show.date);
          if (!parsedDate) return;

          if (!showsByDate[parsedDate]) {
            showsByDate[parsedDate] = [];
          }
          showsByDate[parsedDate].push({
            time: show.time,
            attribute: show.attribute,
            ticketUrl: show.ticketUrl,
          });
        });

        // Create event entries for each date
        Object.entries(showsByDate).forEach(([date, shows]) => {
          const times = shows.map((s) => s.time);
          const accessibility: string[] = [];
          const discount: string[] = [];

          // Parse attributes for accessibility and discounts
          shows.forEach((show) => {
            if (show.attribute) {
              if (show.attribute.includes("OPEN CAPS")) {
                accessibility.push("Open Captions");
              }
              if (show.attribute.includes("EARLY BIRD")) {
                discount.push("Early Bird Pricing");
              }
            }
          });

          events.push({
            date: new Date(date), // Convert to Date object for Prisma
            title: movie.title,
            originalTitle: movie.title,
            times,
            format: "Digital",
            imageUrl: movie.posterUrl || "",
            ariaLabel: `${movie.title} at ${this.theatreName}`,
            theatre: this.theatreName,
            accessibility:
              accessibility.length > 0 ? [...new Set(accessibility)] : [],
            discount: discount.length > 0 ? [...new Set(discount)] : [],
            genres: [], // Will be populated later if needed
            description: null,
            trailerUrl: null,
            imdbId: null,
            rottenTomatoesId: null,
          });
        });
      });

      // Sort events by date
      return events.sort((a, b) => a.date.getTime() - b.date.getTime());
    } catch (error: any) {
      throw new Error(`Failed to scrape Cinema 21: ${error.message}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  async saveToDatabase(events: any[]) {
    console.log(`\nSaving ${events.length} events to database...`);

    // First, delete existing Cinema 21 events to avoid duplicates
    await prisma.movieEvent.deleteMany({
      where: {
        theatre: this.theatreName,
      },
    });
    console.log(`Cleared existing ${this.theatreName} events`);

    // Save new events
    let savedCount = 0;
    for (const event of events) {
      try {
        await prisma.movieEvent.create({
          data: event,
        });
        savedCount++;
        console.log(
          `✓ Saved: ${event.title} on ${event.date.toISOString().split("T")[0]}`
        );
      } catch (error: any) {
        console.error(`✗ Failed to save ${event.title}:`, error.message);
      }
    }

    console.log(
      `\n✅ Successfully saved ${savedCount}/${events.length} events to database`
    );
    return savedCount;
  }
}

// Run the scraper
async function run() {
  const scraper = new Cinema21Scraper();

  try {
    console.log("🎬 Scraping Cinema 21 movie listings...");
    const movieData = await scraper.scrapeMovies();
    console.log(`📊 Found ${movieData.length} total events`);

    if (movieData.length > 0) {
      // Save to database
      const savedCount = await scraper.saveToDatabase(movieData);

      // Show summary
      console.log("\n📈 Summary:");
      console.log(`- Events scraped: ${movieData.length}`);
      console.log(`- Events saved: ${savedCount}`);
      console.log(`- Theatre: ${scraper.theatreName}`);

      // Show sample data
      console.log("\n🎯 Sample events saved:");
      movieData.slice(0, 3).forEach((event, index) => {
        console.log(
          `${index + 1}. ${event.title} - ${
            event.date.toISOString().split("T")[0]
          } (${event.times.length} showtimes)`
        );
      });
    } else {
      console.log("⚠️  No events found to save");
    }
  } catch (error: any) {
    console.error("❌ Error:", error.message);
  } finally {
    // Disconnect from database
    await prisma.$disconnect();
    console.log("\n🔌 Database connection closed");
  }
}

export { Cinema21Scraper };
export { run as runCinema21Scraper };
