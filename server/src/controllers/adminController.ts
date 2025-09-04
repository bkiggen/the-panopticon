import { Request, Response } from "express";
import { runCinema21Scraper } from "../cron/scrapers/cinema21";
import { runAcademyScraper } from "../cron/scrapers/academy";
import { runLaurelhurstScraper } from "../cron/scrapers/laurelhurst";
import { runTomorrowTheaterScraper } from "../cron/scrapers/tomorrow";
import { fetchMovieDataFromOmdb } from "../services/omdbService";
import { runStJohnsCinemaScraper } from "@/cron/scrapers/stJohns";
import { runCSTScraper } from "@/cron/scrapers/clinton";
import { runCinemagicScraper } from "@/cron/scrapers/cinemagic";

export const runScrapers = async (req: Request, res: Response) => {
  try {
    // Cinema 21
    await runCinema21Scraper();
    // Academy Theatre
    await runAcademyScraper();
    // Laurelhurst theater
    await runLaurelhurstScraper();
    // Tomorrow theater
    await runTomorrowTheaterScraper();
    // St Johns
    await runStJohnsCinemaScraper();
    // Clinton
    await runCSTScraper();
    // Cinemagic (unreliable)
    await runCinemagicScraper();

    // Living Room
    // 5th Ave Cinema
    // Movie Madness

    // OMDb
    await fetchMovieDataFromOmdb();

    console.log("Scrapers completed successfully at", new Date().toISOString());

    res.json({ success: true, message: "Jobs complete" });
  } catch (error: any) {
    console.error("❌ Jobs failed:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
