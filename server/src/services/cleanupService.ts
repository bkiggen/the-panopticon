import { prisma } from "../app";

/**
 * Delete movie events older than 180 days to keep the database lean
 */
export const cleanupOldEvents = async (): Promise<number> => {
  // Get today's date in Pacific Time
  const pacificDate = new Date().toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  // Convert MM/DD/YYYY to YYYY-MM-DD
  const [month, day, year] = pacificDate.split("/");
  const todayStr = `${year}-${month}-${day}`;

  // Calculate cutoff date (180 days ago)
  const today = new Date(todayStr + "T00:00:00.000Z");
  const cutoffDate = new Date(today);
  cutoffDate.setDate(cutoffDate.getDate() - 180);

  try {
    const result = await prisma.movieEvent.deleteMany({
      where: {
        date: {
          lt: cutoffDate,
        },
      },
    });

    if (result.count > 0) {
      console.log(`🧹 Cleaned up ${result.count} old movie events (180+ days)`);
    }
    return result.count;
  } catch (error) {
    console.error("❌ Error cleaning up old events:", error);
    throw error;
  }
};
