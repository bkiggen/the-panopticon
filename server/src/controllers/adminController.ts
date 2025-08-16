import { Request, Response } from "express";
import { runCinema21Scraper } from "../cron/scrapers/cinema21";
import { runAcademyScraper } from "../cron/scrapers/academy";
import { runLaurelhurstScraper } from "../cron/scrapers/laurelhurst";
import { runTomorrowTheaterScraper } from "../cron/scrapers/tomorrow";

export const runScrapers = async (req: Request, res: Response) => {
  try {
    console.log("🎬 Starting manual Cinema 21 scrape...");

    await runCinema21Scraper();
    await runAcademyScraper();
    await runLaurelhurstScraper();
    await runTomorrowTheaterScraper();

    res.json({ success: true, message: "Cinema 21 scraping completed" });
  } catch (error: any) {
    console.error("❌ Scraping failed:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
