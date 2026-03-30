import { describe, it, expect } from "vitest";
import { HollywoodScraper } from "./hollywood";

describe("Hollywood Theatre Scraper", () => {
  it("should scrape movie events with 7-day limit", async () => {
    const scraper = new HollywoodScraper();

    // Set to 7 days for faster testing
    scraper.setDaysToScrape(7);

    console.log("\n🎬 Starting Hollywood Theatre scraper test (7 days)...\n");

    const events = await scraper.scrapeMovies();

    console.log(`\n✅ Scraping completed!`);
    console.log(`📊 Total events found: ${events.length}`);

    // Basic validation
    expect(Array.isArray(events)).toBe(true);
    expect(events.length).toBeGreaterThan(0);

    if (events.length > 0) {
      const firstEvent = events[0];

      console.log("\n📝 Sample Event:");
      console.log(`  Title: ${firstEvent.title}`);
      console.log(`  Original Title: ${firstEvent.originalTitle}`);
      console.log(`  Date: ${firstEvent.date.toLocaleDateString()}`);
      console.log(`  Theatre: ${firstEvent.theatre}`);
      console.log(`  Format: ${firstEvent.format}`);
      console.log(
        `  Times: ${firstEvent.times.map((t: { time: string }) => t.time).join(", ")}`
      );
      console.log(`  Detail URL: ${firstEvent.detailUrl || "N/A"}`);
      console.log(`  Image URL: ${firstEvent.imageUrl ? "✓" : "✗"}`);

      // Validate structure of first event
      expect(firstEvent).toHaveProperty("title");
      expect(firstEvent).toHaveProperty("date");
      expect(firstEvent).toHaveProperty("theatre");
      expect(firstEvent).toHaveProperty("times");
      expect(firstEvent.theatre).toBe("Hollywood Theatre");
      expect(firstEvent.date).toBeInstanceOf(Date);
      expect(Array.isArray(firstEvent.times)).toBe(true);
      expect(firstEvent.times.length).toBeGreaterThan(0);

      // Validate format detection
      if (firstEvent.originalTitle.includes("35mm")) {
        expect(firstEvent.format).toBe("35mm");
      } else if (firstEvent.originalTitle.includes("16mm")) {
        expect(firstEvent.format).toBe("16mm");
      } else if (firstEvent.originalTitle.includes("70mm")) {
        expect(firstEvent.format).toBe("70mm");
      }

      // Validate title cleaning
      expect(firstEvent.title).not.toMatch(/\s+in\s+(35mm|16mm|70mm)$/i);
    }

    // Show summary of all events
    console.log("\n📋 Events Summary:");
    const eventsByDate = events.reduce(
      (acc: Record<string, number>, event: typeof events[0]) => {
        const dateStr = event.date.toLocaleDateString();
        acc[dateStr] = (acc[dateStr] || 0) + 1;
        return acc;
      },
      {}
    );

    Object.entries(eventsByDate).forEach(([date, count]) => {
      console.log(`  ${date}: ${count} movies`);
    });

    // Check for format distribution
    const formatCounts = events.reduce(
      (acc: Record<string, number>, event) => {
        acc[event.format] = (acc[event.format] || 0) + 1;
        return acc;
      },
      {}
    );

    console.log("\n🎞️ Format Distribution:");
    Object.entries(formatCounts).forEach(([format, count]) => {
      console.log(`  ${format}: ${count} movies`);
    });
  }, 300000); // 5 minute timeout
});
