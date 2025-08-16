import puppeteer from "puppeteer";
import { promises as fs } from "fs";

class Cinema21Scraper {
  constructor() {
    this.baseUrl = "https://www.cinema21.com";
    this.theatreName = "Cinema 21";
  }

  // Helper function to parse date strings like "Today | August 01" or "Saturday | August 02"
  parseDate(dateString) {
    const currentYear = new Date().getFullYear();
    if (dateString.includes("Today")) {
      const today = new Date();
      return today.toISOString().split("T")[0];
    }

    // Extract month and day from strings like "Saturday | August 02"
    const parts = dateString.split("|");
    if (parts.length === 2) {
      const monthDay = parts[1].trim();
      const [month, day] = monthDay.split(" ");
      const monthMap = {
        January: "01",
        February: "02",
        March: "03",
        April: "04",
        May: "05",
        June: "06",
        July: "07",
        August: "08",
        September: "09",
        October: "10",
        November: "11",
        December: "12",
      };
      const monthNum = monthMap[month];
      const dayNum = day.padStart(2, "0");
      if (monthNum && dayNum) {
        return `${currentYear}-${monthNum}-${dayNum}`;
      }
    }
    return null;
  }

  async scrapeMovies() {
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
      const page = await browser.newPage();
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      );

      console.log("Navigating to Cinema 21...");
      await page.goto(this.baseUrl, { waitUntil: "networkidle2" });
      await page.waitForSelector(".times-tickets-single-movie", {
        timeout: 10000,
      });

      const rawData = await page.evaluate(() => {
        const movies = [];
        const movieContainers = document.querySelectorAll(
          ".times-tickets-single-movie:not(.hidden-print .times-tickets-single-movie)"
        );

        movieContainers.forEach((movieEl) => {
          const titleEl = movieEl.querySelector(
            ".times-tickets-single-movie__heading"
          );
          const ratingEl = movieEl.querySelector(
            ".times-tickets-single-movie__classification-rating"
          );
          const durationEl = movieEl.querySelector(
            ".times-tickets-single-movie__duration"
          );
          const posterEl = movieEl.querySelector(".movie-poster");
          const linkEl = movieEl.querySelector(
            ".times-tickets-single-movie__link"
          );

          if (!titleEl) return;

          const title = titleEl.textContent.trim();
          const rating = ratingEl?.textContent.trim() || "Not Rated";
          const duration = durationEl?.textContent.trim() || "";
          const posterUrl = posterEl?.src;
          const movieUrl = linkEl?.href;

          const showtimes = [];

          // Regular sessions
          const sessionElements = movieEl.querySelectorAll(".single-session");
          sessionElements.forEach((sessionEl) => {
            const dateEl = sessionEl.querySelector(".single-session__date");
            if (!dateEl) return;

            const date = dateEl.textContent.trim();
            const timeSlots = sessionEl.querySelectorAll(".time-slot");

            timeSlots.forEach((slotEl) => {
              const timeEl = slotEl.querySelector(".time-slot__time");
              const attributeEl = slotEl.querySelector(".time-slot__attribute");
              const linkEl = slotEl.querySelector(".time-slot__link");

              if (!timeEl) return;

              const time = timeEl.textContent.trim();
              const attribute = attributeEl?.textContent.trim();
              const ticketUrl = linkEl?.href;

              showtimes.push({
                date,
                time,
                attribute,
                ticketUrl,
              });
            });
          });

          // Hidden sessions
          const hiddenSessions = movieEl.querySelectorAll(
            ".hidden-sessions__wrapper .single-session"
          );
          hiddenSessions.forEach((sessionEl) => {
            const dateEl = sessionEl.querySelector(".single-session__date");
            if (!dateEl) return;

            const date = dateEl.textContent.trim();
            const timeSlots = sessionEl.querySelectorAll(".time-slot");

            timeSlots.forEach((slotEl) => {
              const timeEl = slotEl.querySelector(".time-slot__time");
              const attributeEl = slotEl.querySelector(".time-slot__attribute");
              const linkEl = slotEl.querySelector(".time-slot__link");

              if (!timeEl) return;

              const time = timeEl.textContent.trim();
              const attribute = attributeEl?.textContent.trim();
              const ticketUrl = linkEl?.href;

              showtimes.push({
                date,
                time,
                attribute,
                ticketUrl,
              });
            });
          });

          if (title && showtimes.length > 0) {
            movies.push({
              title,
              rating,
              duration,
              posterUrl,
              movieUrl,
              showtimes,
            });
          }
        });

        return movies;
      });

      // Transform to flat array format
      const events = [];
      rawData.forEach((movie) => {
        // Group showtimes by date
        const showsByDate = {};
        movie.showtimes.forEach((show) => {
          const parsedDate = this.parseDate(show.date);
          if (!parsedDate) return;

          if (!showsByDate[parsedDate]) {
            showsByDate[parsedDate] = [];
          }
          showsByDate[parsedDate].push({
            time: show.time,
            attribute: show.attribute,
            ticketUrl: show.ticketUrl,
          });
        });

        // Create event entries for each date
        Object.entries(showsByDate).forEach(([date, shows]) => {
          const times = shows.map((s) => s.time);
          const accessibility = [];
          const discount = [];

          // Parse attributes for accessibility and discounts
          shows.forEach((show) => {
            if (show.attribute) {
              if (show.attribute.includes("OPEN CAPS")) {
                accessibility.push("Open Captions");
              }
              if (show.attribute.includes("EARLY BIRD")) {
                discount.push("Early Bird Pricing");
              }
            }
          });

          events.push({
            date,
            title: movie.title,
            originalTitle: movie.title,
            times,
            format: "Digital",
            imageUrl: movie.posterUrl || "",
            ariaLabel: "",
            theatre: this.theatreName,
            accessibility:
              accessibility.length > 0 ? [...new Set(accessibility)] : null,
            discount: discount.length > 0 ? [...new Set(discount)] : null,
          });
        });
      });

      // Sort events by date
      return events.sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      throw new Error(`Failed to scrape Cinema 21: ${error.message}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}

// Run the scraper
async function run() {
  const scraper = new Cinema21Scraper();
  try {
    console.log("Scraping Cinema 21 movie listings...");
    const movieData = await scraper.scrapeMovies();

    console.log(`\nFound ${movieData.length} total events`);

    // Save to results directory
    const filename = `./results/cinema21.json`;
    await fs.writeFile(filename, JSON.stringify(movieData, null, 2));
    console.log(`\nData saved to: ${filename}`);

    // Also log the data
    console.log("\n--- CINEMA 21 DATA ---");
    console.log(JSON.stringify(movieData, null, 2));
  } catch (error) {
    console.error("Error:", error.message);
  }
}

// Execute the scraper
run();
