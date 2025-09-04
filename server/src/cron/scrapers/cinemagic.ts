// @ts-nocheck
// THIS IS UNRELIABLE
// Cinemagic Scraper - Fixed with Calendar Navigation
import puppeteer from "puppeteer";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();

// Configuration
const DAYS_TO_SCRAPE = 7; // Change this to scrape more or fewer days

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const prisma = new PrismaClient();

class CinemagicScraper {
  private baseUrl: string;
  public theatreName: string;

  constructor() {
    this.baseUrl = "https://tickets.thecinemagictheater.com/now-showing";
    this.theatreName = "Cinemagic";
  }

  // Helper function to parse date from various formats
  parseDate(dateString: string): Date | null {
    const currentYear = new Date().getFullYear();

    // Handle "Today"
    if (dateString.toLowerCase().includes("today")) {
      return new Date();
    }

    // Handle formats like "Wed 3 Sep", "Thu 4 Sep", "Thu 4Sep", or " Thu 4Sep"
    const dayMatch = dateString.match(/(\w{3})\s+(\d+)\s*(\w{3})/);
    if (dayMatch) {
      const [, dayOfWeek, day, monthAbbr] = dayMatch;
      const monthMap: { [key: string]: number } = {
        Jan: 0,
        Feb: 1,
        Mar: 2,
        Apr: 3,
        May: 4,
        Jun: 5,
        Jul: 6,
        Aug: 7,
        Sep: 8,
        Oct: 9,
        Nov: 10,
        Dec: 11,
      };

      const monthNum = monthMap[monthAbbr];
      if (monthNum !== undefined) {
        const date = new Date(currentYear, monthNum, parseInt(day));

        // If date appears to be in the past (more than 30 days), assume next year
        const today = new Date();
        const daysDifference =
          (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);

        if (daysDifference > 30) {
          date.setFullYear(currentYear + 1);
        }

        return date;
      }
    }

    return null;
  }

  // Helper function to parse time
  parseTime(timeStr: string): [number, number] | null {
    const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      const ampm = timeMatch[3].toUpperCase();

      if (ampm === "PM" && hours !== 12) {
        hours += 12;
      } else if (ampm === "AM" && hours === 12) {
        hours = 0;
      }

      return [hours, minutes];
    }
    return null;
  }

  // Click on a specific date using the calendar
  async selectDateFromCalendar(page: any, targetDate: Date): Promise<boolean> {
    try {
      console.log(
        `🗓️  Attempting to select ${targetDate.toDateString()} using calendar...`
      );

      // Click the "Other Date" calendar button
      const calendarButton = await page.$("[data-v-6b6e5e27] li.calendar");
      if (!calendarButton) {
        console.warn("Calendar button not found");
        return false;
      }

      await calendarButton.click();
      console.log("Clicked calendar button, waiting for modal...");

      await new Promise((resolve: any) => setTimeout(resolve, 3000));

      const day = targetDate.getDate();
      console.log(`Looking for day button: ${day}`);

      // Try to click the date - search in multiple possible locations
      const dateSelected = await page.evaluate((targetDay) => {
        console.log(`Searching for day ${targetDay} button...`);

        // Search in all possible portals and containers
        const searchContainers = [
          "#q-portal--menu--2",
          '[id^="q-portal"]',
          ".q-menu",
          ".q-date",
          ".q-date__calendar-days",
        ];

        for (const containerSelector of searchContainers) {
          const containers = document.querySelectorAll(containerSelector);
          console.log(
            `Found ${containers.length} containers for selector: ${containerSelector}`
          );

          for (const container of containers) {
            // Look for all buttons in this container
            const buttons = container.querySelectorAll("button");
            console.log(`Checking ${buttons.length} buttons in container`);

            for (const button of buttons) {
              // Check if this button contains our target day
              const text = button.textContent?.trim();

              // Also check for span.block specifically
              const blockSpan = button.querySelector("span.block");
              const blockText = blockSpan?.textContent?.trim();

              console.log(`Button text: "${text}", block text: "${blockText}"`);

              if (
                text === targetDay.toString() ||
                blockText === targetDay.toString()
              ) {
                console.log(`Found day ${targetDay} button! Clicking...`);
                button.click();
                return true;
              }
            }
          }
        }

        console.log(`Could not find day ${targetDay} button in any container`);
        return false;
      }, day);

      if (dateSelected) {
        console.log(`Successfully clicked day ${day}`);
        await new Promise((resolve: any) => setTimeout(resolve, 3000)); // Wait for calendar to close and page to update
        return true;
      } else {
        console.log(`Failed to find/click day ${day}`);
        return false;
      }
    } catch (error: any) {
      console.warn("Error selecting date from calendar:", error.message);
      return false;
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
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      );

      console.log(`🎬 Scraping ${this.baseUrl}...`);
      await page.goto(this.baseUrl, { waitUntil: "networkidle2" });
      await page.waitForSelector('[data-test-id="showtimes-date-filter"]', {
        timeout: 10000,
      });

      await new Promise((resolve: any) => setTimeout(resolve, 2000));

      const allEvents: any[] = [];
      const today = new Date();

      // Scrape today first (default page load)
      console.log("📅 Scraping today's events (Sep 3)...");
      const todayEvents = await this.scrapeDateEventsForToday(page, today);
      allEvents.push(...todayEvents);

      // Then use calendar to select subsequent days (Sep 4 through Sep 9 for 7 days total)
      for (let i = 1; i < daysToScrape; i++) {
        try {
          const targetDate = new Date(today);
          targetDate.setDate(today.getDate() + i);

          console.log(
            `📅 Day ${i}: Selecting ${targetDate.toDateString()} from calendar...`
          );

          const success = await this.selectDateFromCalendar(page, targetDate);
          if (!success) {
            console.warn(
              `Failed to select ${targetDate.toDateString()}, trying direct tab click...`
            );

            // Fallback: try clicking date tabs directly (limited to ~4 days)
            const dateTabs = await page.$(
              "[data-v-6b6e5e27] li:not(.calendar)"
            );
            if (dateTabs[i]) {
              await dateTabs[i].click();
              await new Promise((resolve: any) => setTimeout(resolve, 3000));
            } else {
              console.log(`No more dates available for day ${i}`);
              break;
            }
          }

          // Scrape events for this date
          const dayEvents = await this.scrapeDateEventsWithActiveDate(page);
          allEvents.push(...dayEvents);
        } catch (error: any) {
          console.warn(`⚠️  Error scraping day ${i}:`, error.message);
        }
      }

      console.log(`📊 Found ${allEvents.length} total events`);
      return allEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
    } catch (error: any) {
      throw new Error(`Failed to scrape Cinemagic: ${error.message}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  // Scrape today's events (when page first loads)
  async scrapeDateEventsForToday(page: any, today: Date): Promise<any[]> {
    console.log(`📅 Scraping events for today: ${today.toDateString()}`);
    return this.scrapeDateEvents(page, today);
  }

  // Scrape events and get date from active tab
  async scrapeDateEventsWithActiveDate(page: any): Promise<any[]> {
    // Get the active date from the page
    const activeDateText = await page.evaluate(() => {
      const activeTab = document.querySelector("[data-v-6b6e5e27] li.active");
      if (activeTab) {
        return activeTab.textContent?.trim() || "";
      }
      return null;
    });

    console.log(`📅 Active date text: "${activeDateText}"`);

    if (!activeDateText) {
      console.warn("Could not find active date, skipping");
      return [];
    }

    const currentDate = this.parseDate(activeDateText);
    if (!currentDate) {
      console.warn(`Could not parse date from "${activeDateText}"`);
      return [];
    }

    console.log(`📅 Scraping events for: ${currentDate.toDateString()}`);
    return this.scrapeDateEvents(page, currentDate);
  }

  // Core method to scrape events for a specific date
  async scrapeDateEvents(page: any, targetDate: Date): Promise<any[]> {
    try {
      const rawData = await page.evaluate(() => {
        const events: any[] = [];

        const movieContainers = document.querySelectorAll(
          '[data-test-id="showtimes-list"] .poster-list .col-12'
        );

        movieContainers.forEach((container) => {
          const titleElement = container.querySelector(".poster-title");
          if (!titleElement) return;

          const title = titleElement.textContent?.trim() || "";

          // Extract duration and genre
          const infoElement = container.querySelector(".col-auto");
          let duration = "";
          let genre = "";
          if (infoElement) {
            const infoText = infoElement.textContent?.trim() || "";
            const parts = infoText.split("·").map((p) => p.trim());
            if (parts.length >= 2) {
              duration = parts[0];
              genre = parts[1];
            }
          }

          const imageElement = container.querySelector(
            ".q-img__image"
          ) as HTMLImageElement;
          const imageUrl = imageElement?.src || "";

          const formatChips = container.querySelectorAll(".q-chip");
          const formats: string[] = [];
          const accessibility: string[] = [];

          formatChips.forEach((chip) => {
            const chipText = chip.textContent?.trim() || "";
            const chipClasses = chip.className;

            if (
              chipClasses.includes("digital-cinema") ||
              chipText.toLowerCase().includes("digital")
            ) {
              formats.push("Digital");
            }
            if (
              chipClasses.includes("wheelchair-accessible") ||
              chip.querySelector('[aria-hidden="true"]')?.textContent ===
                "accessible"
            ) {
              accessibility.push("Wheelchair Accessible");
            }
          });

          const showtimeButtons = container.querySelectorAll(
            '[data-test-id="showtimes-button-compact-enabled"], [data-test-id="showtimes-button-compact-disabled"]'
          );
          const times: string[] = [];

          showtimeButtons.forEach((button) => {
            const timeText = button.textContent?.trim();
            if (timeText) {
              times.push(timeText);
            }
          });

          if (title && times.length > 0) {
            events.push({
              title,
              duration,
              genre,
              imageUrl,
              formats,
              accessibility,
              times,
            });
          }
        });

        return events;
      });

      // Transform to database format - THIS IS WHERE THE BUG MIGHT BE
      const events: any[] = [];

      rawData.forEach((movie) => {
        console.log(
          `📽️  ${
            movie.title
          } on ${targetDate.toDateString()}: ${movie.times.join(", ")}`
        );

        movie.times.forEach((timeStr: string) => {
          const parsedTime = this.parseTime(timeStr);
          if (parsedTime) {
            const [hours, minutes] = parsedTime;
            // CRITICAL: Make sure we use the targetDate correctly
            const eventDateTime = new Date(targetDate.getTime()); // Clone the date
            eventDateTime.setHours(hours, minutes, 0, 0);

            console.log(
              `🕒 Creating event: ${movie.title} at ${eventDateTime.toString()}`
            );

            events.push({
              date: eventDateTime,
              title: movie.title,
              originalTitle: movie.title,
              times: [timeStr],
              format: movie.formats.length > 0 ? movie.formats[0] : "Digital",
              imageUrl: movie.imageUrl || "",
              ariaLabel: `${movie.title} at ${this.theatreName}`,
              theatre: this.theatreName,
              accessibility: movie.accessibility || [],
              discount: [],
              genres: movie.genre ? [movie.genre] : [],
              description: movie.duration ? `Runtime: ${movie.duration}` : null,
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

  async saveToDatabase(events: any[]) {
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
  const scraper = new CinemagicScraper();
  try {
    console.log(`🎬 Starting Cinemagic scraper for ${DAYS_TO_SCRAPE} days...`);

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
      console.log("⚠️  No events found to save");
    }
  } catch (error: any) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
    console.log("\n🔌 Database connection closed");
  }
}

export { CinemagicScraper };
export { run as runCinemagicScraper };
