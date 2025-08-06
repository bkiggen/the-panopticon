import cron from "node-cron";
import { prisma } from "../app";

// Example scraper job - runs every hour
cron.schedule("0 * * * *", async () => {
  console.log("Running scraper job...");

  try {
    // Your scraping logic here
    // const scrapedData = await scrapeData();

    // Save to database
    // await prisma.yourModel.create({
    //   data: scrapedData
    // });

    console.log("Scraper job completed");
  } catch (error) {
    console.error("Scraper job failed:", error);
  }
});

// Example cleanup job - runs daily at 2 AM
cron.schedule("0 2 * * *", async () => {
  console.log("Running cleanup job...");

  try {
    // Remove old data
    // await prisma.yourModel.deleteMany({
    //   where: {
    //     createdAt: {
    //       lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
    //     }
    //   }
    // });

    console.log("Cleanup job completed");
  } catch (error) {
    console.error("Cleanup job failed:", error);
  }
});
