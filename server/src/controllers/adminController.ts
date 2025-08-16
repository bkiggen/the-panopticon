import { Request, Response } from "express";
import { runCinema21Scraper } from "../cron/scrapers/cinema21";

export const runScrapers = async (req: Request, res: Response) => {
  try {
    console.log("🎬 Starting manual Cinema 21 scrape...");

    // Run the Cinema 21 scraper
    await runCinema21Scraper();

    res.json({ success: true, message: "Cinema 21 scraping completed" });
  } catch (error: any) {
    console.error("❌ Scraping failed:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
