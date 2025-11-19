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
import logStreamService from "../services/logStreamService";

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

    logStreamService.log(`🚀 Running scrapers: ${scrapersToRun.join(", ")}`);

    for (const scraperName of scrapersToRun) {
      if (scraperMap[scraperName as keyof typeof scraperMap]) {
        logStreamService.log(`▶️  Running ${scraperName} scraper...`);
        await scraperMap[scraperName as keyof typeof scraperMap]();
      }
    }

    logStreamService.log(
      `✅ Selected scrapers completed successfully at ${new Date().toISOString()}`
    );
    res.json({
      success: true,
      message: "Selected scrapers complete",
      scrapers: scrapersToRun,
    });
  } catch (error: any) {
    logStreamService.error(`❌ Scrapers failed: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Server-Sent Events endpoint for real-time log streaming
 */
export const streamLogs = (req: Request, res: Response) => {
  // Set headers for SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Add client to log stream
  logStreamService.addClient(res);

  // Send initial connection message
  res.write(`data: ${JSON.stringify({
    timestamp: new Date().toISOString(),
    message: "📡 Connected to log stream",
    type: "info"
  })}\n\n`);

  // Handle client disconnect
  req.on("close", () => {
    logStreamService.removeClient(res);
  });
};
