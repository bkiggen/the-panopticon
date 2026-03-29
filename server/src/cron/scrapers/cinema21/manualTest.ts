/**
 * Manual test script for Cinema 21 scraper
 *
 * Run with: npx ts-node src/cron/scrapers/cinema21/manualTest.ts
 *
 * IMPORTANT: Must use ts-node, not tsx (tsx doesn't work with Puppeteer's page.evaluate)
 * IMPORTANT: This only tests scraping, not database saves. Use scraper.run() for full DB test.
 */
import fs from "fs";
import path from "path";
import { Cinema21Scraper } from "./scraper";

const RESULTS_FILE = path.join(__dirname, "testResults.json");

async function runManualTest(): Promise<void> {
  const scraper = new Cinema21Scraper();

  const events = await scraper.scrapeMovies();

  // Transform dates to strings for JSON
  const results = {
    timestamp: new Date().toISOString(),
    theatre: scraper.theatreName,
    count: events.length,
    events: events.map((e) => ({
      ...e,
      date: e.date.toISOString().split("T")[0],
    })),
  };

  fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
  console.log(`\n📁 Results written to: ${RESULTS_FILE}`);
}

runManualTest().catch(console.error);
