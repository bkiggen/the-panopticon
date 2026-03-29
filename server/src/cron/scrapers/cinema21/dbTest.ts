/**
 * Database integration test for Cinema 21 scraper
 * Tests the full flow: scrape → save to DB → verify
 *
 * Run with: npx ts-node src/cron/scrapers/cinema21/dbTest.ts
 */
import { Cinema21Scraper } from "./scraper";
import { prisma } from "../../../lib/prisma";

async function runDatabaseTest(): Promise<void> {
  const scraper = new Cinema21Scraper();

  console.log("\n🧪 Starting Cinema 21 Database Integration Test\n");
  console.log("=" .repeat(60));

  try {
    // Step 1: Check existing records
    console.log("\n📊 Step 1: Checking existing Cinema 21 records...");
    const existingCount = await prisma.movieEvent.count({
      where: { theatre: "Cinema 21" },
    });
    console.log(`   Found ${existingCount} existing records`);

    // Step 2: Run the scraper with database save
    console.log("\n🎬 Step 2: Running scraper with database save...");
    const result = await scraper.run({ verbose: true });

    console.log("\n📈 Scraper Results:");
    console.log(`   Events scraped: ${result.eventsScraped}`);
    console.log(`   Events saved: ${result.eventsSaved}`);
    console.log(`   Errors: ${result.errors.length}`);

    if (result.errors.length > 0) {
      console.log("\n❌ Errors encountered:");
      result.errors.forEach((err) => console.log(`   - ${err}`));
    }

    // Step 3: Verify records in database
    console.log("\n🔍 Step 3: Verifying records in database...");
    const newCount = await prisma.movieEvent.count({
      where: { theatre: "Cinema 21" },
    });
    console.log(`   Now have ${newCount} records (${newCount - existingCount} net change)`);

    // Step 4: Check sample records
    console.log("\n📋 Step 4: Checking sample records...");
    const sampleRecords = await prisma.movieEvent.findMany({
      where: { theatre: "Cinema 21" },
      take: 3,
      orderBy: { date: "asc" },
    });

    console.log(`   Showing ${sampleRecords.length} sample records:\n`);
    sampleRecords.forEach((record, i) => {
      console.log(`   ${i + 1}. ${record.title}`);
      console.log(`      Date: ${record.date.toLocaleDateString()}`);
      console.log(`      Times: ${record.times.join(", ")}`);
      console.log(`      Image: ${record.imageUrl ? "✓" : "✗"}`);
      console.log(`      Scraped: ${record.scrapedAt?.toLocaleString()}`);
      console.log();
    });

    // Step 5: Data quality checks
    console.log("🔬 Step 5: Data quality checks...");
    const qualityChecks = await prisma.movieEvent.findMany({
      where: { theatre: "Cinema 21" },
    });

    const missingImages = qualityChecks.filter((r) => !r.imageUrl).length;
    const missingTimes = qualityChecks.filter((r) => r.times.length === 0).length;
    const pastDates = qualityChecks.filter((r) => r.date < new Date()).length;

    console.log(`   Records missing images: ${missingImages}`);
    console.log(`   Records missing times: ${missingTimes}`);
    console.log(`   Records with past dates: ${pastDates}`);

    // Final summary
    console.log("\n" + "=".repeat(60));
    if (result.eventsSaved > 0 && missingTimes === 0) {
      console.log("✅ Test PASSED - Cinema 21 scraper is working correctly!");
    } else if (result.eventsScraped > 0 && result.eventsSaved === 0) {
      console.log("⚠️  Test PARTIAL - Scraping works but database save failed");
    } else {
      console.log("❌ Test FAILED - Check errors above");
    }
    console.log("=" + "=".repeat(60) + "\n");
  } catch (error) {
    console.error("\n💥 Test failed with error:");
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runDatabaseTest().catch(console.error);
