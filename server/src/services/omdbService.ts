import axios from "axios";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const fetchMovieDataFromOmdb = async (): Promise<void> => {
  console.log("Starting OMDB data fetch process...");

  try {
    // 1. Get all movieEvent titles from database
    const movieEvents = await prisma.movieEvent.findMany({
      where: {
        movieDataId: null,
      },
      select: {
        title: true,
      },
    });

    console.log(`Found ${movieEvents.length} total movie events`);

    // 2. Find unique titles
    const uniqueTitles = [...new Set(movieEvents.map((event) => event.title))];
    console.log(`Found ${uniqueTitles.length} unique titles`);

    // 3. Limit to 3 for testing
    const titlesToSearch = uniqueTitles.slice(0, 3);
    console.log(
      `Testing with ${titlesToSearch.length} titles:`,
      titlesToSearch
    );

    // 4. Search OMDB for each title
    const apiKey = process.env.OMDB_API_KEY;
    if (!apiKey) {
      throw new Error("OMDB API key is not set in environment variables");
    }

    const results = [];

    for (const title of titlesToSearch) {
      try {
        console.log(`Searching OMDB for: "${title}"`);

        // Try multiple search strategies
        const searchStrategies = [
          title, // Original title
          title.replace(/[^\w\s,]/g, ""), // Remove special chars except commas
          title.replace(/[^\w\s]/g, ""), // Remove all special chars
          title.split(",")[0].trim(), // Just the part before the first comma
        ];

        let found = false;

        for (let i = 0; i < searchStrategies.length && !found; i++) {
          const searchTitle = searchStrategies[i].trim();
          if (!searchTitle) continue;

          console.log(`  Attempt ${i + 1}: "${searchTitle}"`);

          const url = `http://www.omdbapi.com/?apikey=${apiKey}&t=${encodeURIComponent(
            searchTitle
          )}&type=movie`;
          const response = await axios.get(url);

          if (response.data.Response === "True") {
            results.push({
              originalTitle: title,
              searchTitle: searchTitle,
              strategy: i + 1,
              omdbData: response.data,
            });
            console.log(
              `✅ Found data for: "${title}" using strategy ${i + 1}`
            );
            found = true;
          } else {
            console.log(
              `  ❌ Strategy ${i + 1} failed: ${response.data.Error}`
            );
          }

          // Small delay between attempts
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        if (!found) {
          console.log(`❌ No data found for: "${title}" with any strategy`);
        }
      } catch (error: any) {
        console.error(`Error searching for "${title}":`, error.message);
      }
    }

    // 5. Console log results
    console.log("\n=== OMDB SEARCH RESULTS ===");
    console.log(JSON.stringify(results, null, 2));
    console.log(
      `\nCompleted OMDB search. Found data for ${results.length}/${titlesToSearch.length} movies.`
    );
  } catch (error) {
    console.error("Error in OMDB data fetch process:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};
