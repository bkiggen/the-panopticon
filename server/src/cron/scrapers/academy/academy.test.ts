import { describe, it, expect } from "vitest";
import { AcademyScraper } from "./academy";

describe("Academy Theater Scraper", () => {
  it("should scrape movie events with 7-day limit", async () => {
    const scraper = new AcademyScraper();

    // Set to 7 days for faster testing
    scraper.setDaysToScrape(7);

    console.log("\n🎬 Starting Academy Theater scraper test (7 days)...\n");

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
      console.log(`  Date: ${firstEvent.date.toLocaleDateString()}`);
      console.log(`  Theatre: ${firstEvent.theatre}`);
      console.log(`  Times: ${firstEvent.times.map(t => t.time).join(", ")}`);
      console.log(`  Ticket URLs: ${firstEvent.times.filter(t => t.ticketUrl).length}/${firstEvent.times.length} showtimes have ticket URLs`);
      console.log(`  Detail URL: ${firstEvent.detailUrl || "N/A"}`);
      console.log(`  Image URL: ${firstEvent.imageUrl ? "✓" : "✗"}`);

      // Validate structure of first event
      expect(firstEvent).toHaveProperty("title");
      expect(firstEvent).toHaveProperty("date");
      expect(firstEvent).toHaveProperty("theatre");
      expect(firstEvent).toHaveProperty("times");
      expect(firstEvent.theatre).toBe("Academy Theater");
      expect(firstEvent.date).toBeInstanceOf(Date);
      expect(Array.isArray(firstEvent.times)).toBe(true);
      expect(firstEvent.times.length).toBeGreaterThan(0);

      // Validate that at least some showtimes have ticket URLs
      const timesWithTickets = firstEvent.times.filter(t => t.ticketUrl);
      expect(timesWithTickets.length).toBeGreaterThan(0);

      // Validate ticket URL format (should be booking.academytheaterpdx.com)
      const firstTicketUrl = timesWithTickets[0].ticketUrl;
      expect(firstTicketUrl).toBeDefined();
      expect(firstTicketUrl).toContain("booking.academytheaterpdx.com");

      // Validate detail URL format (should be academytheaterpdx.com/movies/...)
      if (firstEvent.detailUrl) {
        expect(firstEvent.detailUrl).toContain("academytheaterpdx.com/movies/");
      }
    }

    // Show summary of all events
    console.log("\n📋 Events Summary:");
    const eventsByDate = events.reduce((acc, event) => {
      const dateStr = event.date.toLocaleDateString();
      acc[dateStr] = (acc[dateStr] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(eventsByDate).forEach(([date, count]) => {
      console.log(`  ${date}: ${count} movies`);
    });
  }, 300000); // 5 minute timeout for the scraping test
});
