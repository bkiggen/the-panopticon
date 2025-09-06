import { Request, Response } from "express";
import { runCinema21Scraper } from "../cron/scrapers/cinema21";
import { runAcademyScraper } from "../cron/scrapers/academy";
import { runLaurelhurstScraper } from "../cron/scrapers/laurelhurst";
import { runTomorrowTheaterScraper } from "../cron/scrapers/tomorrow";
import { fetchMovieDataFromOmdb } from "../services/omdbService";
import { runStJohnsCinemaScraper } from "@/cron/scrapers/stJohns";
import { runCSTScraper } from "@/cron/scrapers/clinton";
import { runCinemagicScraper } from "@/cron/scrapers/cinemagic";
import { runLivingRoomTheatersScraper } from "@/cron/scrapers/livingRoom";

export const runScrapers = async (req: Request, res: Response) => {
  try {
    const { scrapers } = req.body;

    // Default to all scrapers if none specified
    const scrapersToRun = scrapers || [
      "cinema21",
      "academy",
      "laurelhurst",
      "tomorrow",
      "stJohns",
      "clinton",
      "cinemagic",
      "livingRoom",
      "omdb",
    ];

    const scraperMap = {
      cinema21: runCinema21Scraper,
      academy: runAcademyScraper,
      laurelhurst: runLaurelhurstScraper,
      tomorrow: runTomorrowTheaterScraper,
      stJohns: runStJohnsCinemaScraper,
      clinton: runCSTScraper,
      cinemagic: runCinemagicScraper,
      livingRoom: runLivingRoomTheatersScraper,
      omdb: fetchMovieDataFromOmdb,
    };

    console.log(`Running scrapers: ${scrapersToRun.join(", ")}`);

    for (const scraperName of scrapersToRun) {
      if (scraperMap[scraperName as keyof typeof scraperMap]) {
        console.log(`Running ${scraperName} scraper...`);
        await scraperMap[scraperName as keyof typeof scraperMap]();
      }
    }

    console.log(
      "Selected scrapers completed successfully at",
      new Date().toISOString()
    );
    res.json({
      success: true,
      message: "Selected scrapers complete",
      scrapers: scrapersToRun,
    });
  } catch (error: any) {
    console.error("❌ Scrapers failed:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
