import { AcademyScraper } from "./academy/academy";
import { ScrapedMovieEvent } from "./utils";

async function testAcademy90Days() {
  console.log("🎬 Starting Academy Theater scraper with 90-day range...\n");

  const scraper = new AcademyScraper();

  // Use default 90 days
  console.log("📅 Date range: 90 days (default)\n");

  try {
    const startTime = Date.now();
    const events = await scraper.scrapeMovies();
    const duration = Math.round((Date.now() - startTime) / 1000);

    console.log(`\n✅ Scraping completed in ${duration} seconds!`);
    console.log(`📊 Total events found: ${events.length}`);

    if (events.length > 0) {
      // Group by date
      const eventsByDate = events.reduce((acc: Record<string, ScrapedMovieEvent[]>, event: ScrapedMovieEvent) => {
        const dateStr = event.date.toLocaleDateString();
        if (!acc[dateStr]) {
          acc[dateStr] = [];
        }
        acc[dateStr].push(event);
        return acc;
      }, {});

      console.log(`\n📋 Events by Date:`);
      console.log(`   Total dates with events: ${Object.keys(eventsByDate).length}`);

      // Show first few dates
      const dateKeys = Object.keys(eventsByDate).slice(0, 10);
      for (const date of dateKeys) {
        console.log(`   ${date}: ${eventsByDate[date].length} movies`);
      }

      if (Object.keys(eventsByDate).length > 10) {
        console.log(`   ... and ${Object.keys(eventsByDate).length - 10} more dates`);
      }

      // Show sample event
      console.log(`\n📝 Sample Event:`);
      const sample = events[0];
      console.log(`   Title: ${sample.title}`);
      console.log(`   Date: ${sample.date.toLocaleDateString()}`);
      console.log(`   Times: ${sample.times.map((t: { time: string }) => t.time).join(", ")}`);
      console.log(`   Ticket URLs: ${sample.times.filter((t: { ticketUrl?: string }) => t.ticketUrl).length}/${sample.times.length}`);
      console.log(`   Detail URL: ${sample.detailUrl || "N/A"}`);
      console.log(`   Image URL: ${sample.imageUrl ? "✓" : "✗"}`);

      console.log("\n✨ Scraper test completed successfully!");
    } else {
      console.log("\n⚠️  No events found - this might indicate a problem");
    }
  } catch (error) {
    console.error("\n💥 Error during scraping:");
    console.error(error);
    process.exit(1);
  }
}

testAcademy90Days();
