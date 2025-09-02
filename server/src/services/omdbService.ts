import axios from "axios";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const fetchMovieDataFromOmdb = async (): Promise<void> => {
  console.log("Starting OMDB data fetch process...");

  try {
    // 1. Get all movieEvent titles from database that don't have movie data
    const movieEvents = await prisma.movieEvent.findMany({
      where: {
        movieDataId: null,
      },
      select: {
        title: true,
      },
    });

    console.log(`Found ${movieEvents.length} movie events without movie data`);

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
        let omdbData = null;

        for (let i = 0; i < searchStrategies.length && !found; i++) {
          const searchTitle = searchStrategies[i].trim();
          if (!searchTitle) continue;

          console.log(`  Attempt ${i + 1}: "${searchTitle}"`);

          const url = `http://www.omdbapi.com/?apikey=${apiKey}&t=${encodeURIComponent(
            searchTitle
          )}&type=movie`;
          const response = await axios.get(url);

          if (response.data.Response === "True") {
            omdbData = response.data;
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

        // 5. Save to database if found
        if (found && omdbData) {
          try {
            // Check if movie data already exists (avoid duplicates)
            const existingMovieData = await prisma.movieData.findFirst({
              where: {
                imdbId: omdbData.imdbID,
              },
            });

            let movieDataId;

            if (existingMovieData) {
              console.log(
                `  📋 Using existing movie data for IMDB ID: ${omdbData.imdbID}`
              );
              movieDataId = existingMovieData.id;
            } else {
              // Create new movie data record
              const movieDataRecord = await prisma.movieData.create({
                data: {
                  title: omdbData.Title,
                  originalTitle: omdbData.Title, // or use a different field if available
                  description: omdbData.Plot,
                  imageUrl: omdbData.Poster !== "N/A" ? omdbData.Poster : null,
                  trailerUrl: null, // OMDB doesn't provide trailer URLs
                  omdbId: omdbData.imdbID, // Use imdbID as omdbId
                  imdbId: omdbData.imdbID,
                  rottenTomatoesId: null, // OMDB doesn't provide this
                  genres: omdbData.Genre ? omdbData.Genre.split(", ") : [], // Convert comma-separated string to array
                },
              });

              movieDataId = movieDataRecord.id;
              console.log(
                `  💾 Created new movie data record with ID: ${movieDataId}`
              );
            }

            // 6. Associate movie events with this movie data
            const updateResult = await prisma.movieEvent.updateMany({
              where: {
                title: title,
                movieDataId: null,
              },
              data: {
                movieDataId: movieDataId,
              },
            });

            console.log(
              `  🔗 Associated ${updateResult.count} movie events with movie data`
            );
          } catch (dbError: any) {
            console.error(
              `Error saving movie data for "${title}":`,
              dbError.message
            );
          }
        } else {
          console.log(`❌ No data found for: "${title}" with any strategy`);
        }
      } catch (error: any) {
        console.error(`Error searching for "${title}":`, error.message);
      }
    }

    // 7. Clean up orphaned movie data
    console.log("\n=== CLEANING UP ORPHANED MOVIE DATA ===");

    const orphanedMovieData = await prisma.movieData.findMany({
      where: {
        movieEvents: {
          none: {},
        },
      },
      select: {
        id: true,
        title: true,
      },
    });

    if (orphanedMovieData.length > 0) {
      console.log(
        `Found ${orphanedMovieData.length} orphaned movie data records`
      );

      const deleteResult = await prisma.movieData.deleteMany({
        where: {
          movieEvents: {
            none: {},
          },
        },
      });

      console.log(
        `🗑️ Deleted ${deleteResult.count} orphaned movie data records`
      );
    } else {
      console.log("No orphaned movie data found");
    }

    // 8. Final summary
    console.log("\n=== SUMMARY ===");
    console.log(`Processed ${titlesToSearch.length} titles`);
    console.log(
      `Successfully found and saved data for ${results.length} movies`
    );
    console.log("OMDB data fetch process completed successfully!");
  } catch (error) {
    console.error("Error in OMDB data fetch process:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};
