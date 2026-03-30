import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

interface ManualMovieEvent {
  date: string; // ISO date string
  title: string;
  originalTitle: string;
  times: Array<{ time: string; ticketUrl?: string }>;
  detailUrl?: string | null;
  format?: string;
  imageUrl?: string;
  genres?: string[];
  description?: string | null;
  theatre: string;
  accessibility?: string[];
  discount?: string[];
}

/**
 * Accept manually scraped movie events (for Hollywood Theatre, etc.)
 * POST /api/admin/manual-scrape
 */
export async function uploadManualScrape(req: Request, res: Response) {
  try {
    const { events, theatre } = req.body as {
      events: ManualMovieEvent[];
      theatre: string;
    };

    if (!events || !Array.isArray(events)) {
      return res.status(400).json({ error: "Invalid events array" });
    }

    if (!theatre) {
      return res.status(400).json({ error: "Theatre name required" });
    }

    console.log(`📤 Receiving ${events.length} manual events for ${theatre}`);

    // Delete existing events for this theatre
    await prisma.movieEvent.deleteMany({
      where: { theatre },
    });

    console.log(`🗑️  Cleared old ${theatre} events`);

    // Save new events
    let savedCount = 0;
    const errors: string[] = [];

    for (const event of events) {
      try {
        await prisma.movieEvent.create({
          data: {
            date: new Date(event.date),
            title: event.title,
            originalTitle: event.originalTitle,
            times: event.times as any, // Prisma will handle JSONB
            detailUrl: event.detailUrl || null,
            format: event.format || "Digital",
            imageUrl: event.imageUrl || "",
            genres: event.genres || [],
            description: event.description || null,
            theatre: event.theatre,
            accessibility: event.accessibility || [],
            discount: event.discount || [],
            scrapedAt: new Date(),
          },
        });
        savedCount++;
      } catch (error) {
        const err = error as Error & { code?: string };
        errors.push(`${event.title}: ${err.message}`);
      }
    }

    console.log(`✅ Saved ${savedCount}/${events.length} events`);

    if (errors.length > 0) {
      console.warn(`⚠️  ${errors.length} errors:`, errors);
    }

    return res.json({
      success: true,
      theatre,
      eventsReceived: events.length,
      eventsSaved: savedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error in manual scrape upload:", error);
    return res.status(500).json({
      error: "Failed to save events",
      details: (error as Error).message,
    });
  }
}

/**
 * Get status of manual scraping
 * GET /api/admin/manual-scrape/status
 */
export async function getManualScrapeStatus(req: Request, res: Response) {
  try {
    const { theatre } = req.query;

    const where = theatre ? { theatre: theatre as string } : {};

    const events = await prisma.movieEvent.findMany({
      where,
      orderBy: [{ scrapedAt: "desc" }, { date: "asc" }],
      take: 100,
    });

    const theatres = await prisma.movieEvent.groupBy({
      by: ["theatre"],
      _count: true,
      orderBy: {
        theatre: "asc",
      },
    });

    return res.json({
      totalEvents: events.length,
      theatres: theatres.map((t) => ({
        name: t.theatre,
        count: t._count,
      })),
      recentEvents: events.slice(0, 10).map((e) => ({
        title: e.title,
        date: e.date,
        theatre: e.theatre,
        scrapedAt: e.scrapedAt,
      })),
    });
  } catch (error) {
    console.error("Error getting manual scrape status:", error);
    return res.status(500).json({
      error: "Failed to get status",
      details: (error as Error).message,
    });
  }
}
