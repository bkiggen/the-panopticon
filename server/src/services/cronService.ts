import cron from "node-cron";
import axios from "axios";
import { fetchMovieDataFromOmdb } from "./omdbService";

export function initializeCronJobs(): void {
  if (process.env.NODE_ENV === "production") {
    cron.schedule("0 6,14,22 * * *", async () => {
      try {
        console.log("Running scheduled scrapers...");
        await sendScraperRequest();
        await fetchMovieDataFromOmdb();
        console.log(
          "Scrapers completed successfully at",
          new Date().toISOString()
        );
        await fetchMovieDataFromOmdb();
        console.log(
          "OMDb data fetch completed successfully at",
          new Date().toISOString()
        );
      } catch (error: any) {
        console.error("Scraper job failed:", error.message);
      }
    });

    console.log("Cron jobs scheduled for 6 AM, 2 PM, and 10 PM daily");
  }
}

export const sendScraperRequest = async () => {
  const port = process.env.PORT || 3021;
  const baseUrl = `http://localhost:${port}`;
  await axios.get(`${baseUrl}/api/admin/run-scrapers`, {
    timeout: 600000, // 10 minutes for scraping
  });
};
