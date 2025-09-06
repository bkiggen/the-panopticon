import puppeteer from "puppeteer";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

// Load environment variables
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const prisma = new PrismaClient();

class CSTScraper {
  private baseUrl: string;
  public theatreName: string;

  constructor() {
    this.baseUrl = "https://cstpdx.com/schedule/month/";
    this.theatreName = "Clinton Street Theater";
  }

  // Helper function to parse various date formats from CST
  parseDate(dateString: string): Date | null {
    const currentYear = new Date().getFullYear();

    // Handle formats like "Sunday, September 28 @ 3:00 PM"
    const fullDateMatch = dateString.match(
      /(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),\s+(\w+)\s+(\d+)\s+@\s+(\d{1,2}:\d{2}\s*(?:AM|PM))/i
    );
    if (fullDateMatch) {
      const [, dayOfWeek, month, day, time] = fullDateMatch;
      const date = this.parseMonthDay(month, day, currentYear);
      if (date) {
        const [hours, minutes, ampm] = this.parseTime(time);
        if (hours !== null && minutes !== null) {
          date.setHours(hours, minutes, 0, 0);
          return date;
        }
      }
    }

    // Handle formats like "October 2" or "September 28"
    const monthDayMatch = dateString.match(/(\w+)\s+(\d+)/);
    if (monthDayMatch) {
      const [, month, day] = monthDayMatch;
      return this.parseMonthDay(month, day, currentYear);
    }

    return null;
  }

  private parseMonthDay(month: string, day: string, year: number): Date | null {
    const monthMap: { [key: string]: number } = {
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

    const monthNum = monthMap[month];
    const dayNum = parseInt(day, 10);

    if (monthNum !== undefined && !isNaN(dayNum)) {
      const date = new Date(year, monthNum, dayNum);

      // If the date is in the past, assume it's next year
      const today = new Date();
      if (date < today) {
        date.setFullYear(year + 1);
      }

      return date;
    }

    return null;
  }

  private parseTime(timeStr: string): [number | null, number | null, string] {
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

      return [hours, minutes, ampm];
    }
    return [null, null, ""];
  }

  // Extract price from text
  private extractPrice(text: string): string | null {
    const priceMatch = text.match(/\$(\d+)/);
    return priceMatch ? `$${priceMatch[1]}` : null;
  }

  async scrapeEvents(monthUrl?: string) {
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

      const targetUrl = monthUrl || this.baseUrl;
      console.log(`🎬 Scraping ${targetUrl}...`);

      await page.goto(targetUrl, { waitUntil: "networkidle2" });

      // Wait for the calendar to load
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const rawData = await page.evaluate(() => {
        const events: any[] = [];

        // Get all text content and split into lines for parsing
        const bodyText = document.body.textContent || "";
        const lines = bodyText
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line.length > 0);

        let currentEvent: any = null;
        let eventId = 0;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          // Skip navigation and header text
          if (
            line.includes("Calendar of Events") ||
            line.includes("Views Navigation") ||
            line.includes("Select date") ||
            line.match(/^[SMTWF]$/) || // Day abbreviations
            line.match(/^\d+$/) || // Just numbers
            line.includes("events found") ||
            line.includes("Subscribe to calendar") ||
            line.includes("There are no events")
          ) {
            continue;
          }

          // Look for datetime patterns like "Sunday, September 28 @ 3:00 PM"
          const datetimeMatch = line.match(
            /(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),\s+(\w+\s+\d+)\s+@\s+(\d{1,2}:\d{2}\s*(?:AM|PM))/i
          );
          if (datetimeMatch) {
            // Save previous event if it exists
            if (currentEvent && currentEvent.title) {
              events.push({
                ...currentEvent,
                id: `cst_${eventId++}`,
              });
            }

            // Start new event
            currentEvent = {
              datetime: line,
              date: datetimeMatch[2], // "September 28"
              time: datetimeMatch[3], // "3:00 PM"
              title: "",
              description: "",
              price: "",
            };
            continue;
          }

          // Look for standalone time patterns (backup)
          const timeMatch = line.match(/^(\d{1,2}:\d{2}\s*(?:AM|PM))$/i);
          if (timeMatch && !currentEvent) {
            currentEvent = {
              time: timeMatch[1],
              title: "",
              description: "",
              price: "",
              datetime: "",
              date: "",
            };
            continue;
          }

          // Look for price patterns
          const priceMatch = line.match(/^\$(\d+)$/);
          if (priceMatch && currentEvent) {
            currentEvent.price = line;
            continue;
          }

          // If we have an event context but no title yet, this might be the title
          if (
            currentEvent &&
            !currentEvent.title &&
            line.length > 3 &&
            !line.includes("events,") &&
            !timeMatch &&
            !priceMatch &&
            !line.match(/^\d/) &&
            !line.includes("@") &&
            line.length < 100
          ) {
            // Skip obvious non-title lines
            if (!line.includes("Select date") && !line.includes("Calendar")) {
              currentEvent.title = line;
              continue;
            }
          }

          // Collect description if we have title but no price yet
          if (
            currentEvent &&
            currentEvent.title &&
            !currentEvent.price &&
            line.length > 10 &&
            !line.includes("$") &&
            !line.includes("events,") &&
            !line.match(/^\d{1,2}:\d{2}/) &&
            line !== currentEvent.title
          ) {
            // Avoid duplicate content and navigation text
            if (
              !currentEvent.description.includes(line) &&
              !line.includes("Calendar") &&
              !line.includes("Navigation")
            ) {
              currentEvent.description +=
                (currentEvent.description ? " " : "") + line;
            }
          }
        }

        // Don't forget the last event
        if (currentEvent && currentEvent.title) {
          events.push({
            ...currentEvent,
            id: `cst_${eventId++}`,
          });
        }

        return events;
      });

      console.log(`📊 Found ${rawData.length} raw events`);

      // Transform to database format
      const events: any[] = [];
      const seenEvents = new Set<string>(); // Track duplicates

      rawData.forEach((event) => {
        if (!event.title || (!event.datetime && !event.date)) return;

        // Skip invalid titles
        if (
          event.title.toLowerCase().includes("event series") ||
          event.title.toLowerCase() === "events" ||
          event.title.toLowerCase().includes("navigation") ||
          event.title.toLowerCase().includes("calendar") ||
          event.title.length < 2
        ) {
          return;
        }

        // Parse the date
        const dateToUse = event.datetime || `${event.date} @ ${event.time}`;
        const parsedDate = this.parseDate(dateToUse);

        if (!parsedDate) {
          console.warn(`⚠️  Could not parse date for: ${event.title}`);
          return;
        }

        // Extract time if not already parsed
        let timeStr = event.time;
        if (!timeStr && event.datetime) {
          const timeMatch = event.datetime.match(
            /(\d{1,2}:\d{2}\s*(?:AM|PM))/i
          );
          timeStr = timeMatch ? timeMatch[1] : "";
        }

        // Create unique key to prevent duplicates
        const uniqueKey = `${event.title}-${
          parsedDate.toISOString().split("T")[0]
        }-${timeStr}`;
        if (seenEvents.has(uniqueKey)) {
          return; // Skip duplicate
        }
        seenEvents.add(uniqueKey);

        // Clean up description
        let description = event.description || "";
        if (description.length > 500) {
          description = description.substring(0, 500) + "...";
        }

        // Determine special attributes
        const accessibility: string[] = [];
        const discount: string[] = [];
        const specialNotes: string[] = [];

        if (event.title.toLowerCase().includes("rocky horror")) {
          specialNotes.push("Cult Classic");
          specialNotes.push("Audience Participation");
        }

        if (
          description.toLowerCase().includes("shadowcast") ||
          description.toLowerCase().includes("cabaret")
        ) {
          specialNotes.push("Live Performance");
        }

        events.push({
          date: parsedDate,
          title: event.title,
          originalTitle: event.title,
          times: timeStr ? [timeStr] : [],
          format: "35mm/Digital", // CST shows various formats
          imageUrl: "", // CST doesn't provide images in calendar
          theatre: this.theatreName,
          accessibility,
          discount,
          genres: [], // Could be populated later
          description: description || null,
          trailerUrl: null,
          imdbId: null,
          rottenTomatoesId: null,
          price: event.price || null,
          specialNotes,
        });
      });

      return events.sort((a, b) => a.date.getTime() - b.date.getTime());
    } catch (error: any) {
      throw new Error(
        `Failed to scrape Clinton Street Theater: ${error.message}`
      );
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  async saveToDatabase(events: any[]) {
    // First, delete existing CST events to avoid duplicates
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
          data: {
            ...event,
            // Remove fields that aren't in the schema
            specialNotes: undefined,
            price: undefined,
          },
        });
        savedCount++;
        console.log(
          `✓ Saved: ${event.title} on ${event.date.toLocaleDateString()}`
        );
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

  // Method to scrape specific month
  async scrapeMonth(year: number, month: number) {
    const monthStr = month.toString().padStart(2, "0");
    const monthUrl = `${this.baseUrl}${year}-${monthStr}/`;
    return this.scrapeEvents(monthUrl);
  }
}

// Run the scraper
async function run() {
  const scraper = new CSTScraper();

  try {
    console.log(`🎭 Starting Clinton Street Theater scraper...`);

    // Scrape current month
    const currentEvents = await scraper.scrapeEvents();

    // Optionally scrape next month too
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const nextMonthEvents = await scraper.scrapeMonth(
      nextMonth.getFullYear(),
      nextMonth.getMonth() + 1
    );

    const allEvents = [...currentEvents, ...nextMonthEvents];

    if (allEvents.length > 0) {
      // Save to database
      const savedCount = await scraper.saveToDatabase(allEvents);

      // Show summary
      console.log("\n📈 Summary:");
      console.log(`- Events scraped: ${allEvents.length}`);
      console.log(`- Events saved: ${savedCount}`);
      console.log(`- Theatre: ${scraper.theatreName}`);

      // Show some sample events
      console.log("\n🎬 Sample Events:");
      allEvents.slice(0, 3).forEach((event) => {
        console.log(
          `- ${
            event.title
          } on ${event.date.toLocaleDateString()} at ${event.times.join(", ")}`
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

export { CSTScraper };
export { run as runCSTScraper };
