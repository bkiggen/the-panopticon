import { Request, Response } from "express";
import { runCinema21Scraper } from "../cron/scrapers/cinema21";
import { runAcademyScraper } from "../cron/scrapers/academy";
import { runLaurelhurstScraper } from "../cron/scrapers/laurelhurst";
import { runTomorrowTheaterScraper } from "../cron/scrapers/tomorrow";
import { fetchMovieDataFromOmdb } from "../services/omdbService";

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

    // Clinton
    // Hollywood
    // St Johns
    // Living Room
    // 5th Ave Cinema
    // Movie Madness
    // Cinemagic

    // OMDb
    await fetchMovieDataFromOmdb();

    console.log("Scrapers completed successfully at", new Date().toISOString());

    res.json({ success: true, message: "Jobs complete" });
  } catch (error: any) {
    console.error("❌ Jobs failed:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
