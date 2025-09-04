// @ts-nocheck
import puppeteer from "puppeteer";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

// Load environment variables
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const prisma = new PrismaClient();

class HumanLikeAcademyScraper {
  constructor() {
    this.baseUrl = "https://academytheaterpdx.com/now-playing";
    this.theatreName = "Academy Theater";
  }

  // Simulate human-like mouse movements
  async humanMouseMove(page, fromX, fromY, toX, toY) {
    const steps = Math.floor(Math.random() * 10) + 10; // 10-20 steps

    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;

      // Add some randomness to make it more human-like
      const randomX = (Math.random() - 0.5) * 3;
      const randomY = (Math.random() - 0.5) * 3;

      const x = fromX + (toX - fromX) * progress + randomX;
      const y = fromY + (toY - fromY) * progress + randomY;

      await page.mouse.move(x, y);

      // Random tiny delay between movements
      await this.randomDelay(10, 30);
    }
  }

  // Human-like click with slight offset from center
  async humanClick(page, selector) {
    const element = await page.$(selector);
    if (!element) throw new Error(`Element ${selector} not found`);

    const box = await element.boundingBox();
    if (!box) throw new Error(`Element ${selector} has no bounding box`);

    // Click slightly off-center like a human would
    const offsetX = (Math.random() - 0.5) * (box.width * 0.3);
    const offsetY = (Math.random() - 0.5) * (box.height * 0.3);

    const clickX = box.x + box.width / 2 + offsetX;
    const clickY = box.y + box.height / 2 + offsetY;

    // Move mouse to element first
    await this.humanMouseMove(page, 100, 100, clickX, clickY);

    // Random delay before click
    await this.randomDelay(100, 300);

    await page.mouse.click(clickX, clickY);

    // Random delay after click
    await this.randomDelay(200, 500);
  }

  // Random delay to simulate human thinking/reading time
  async randomDelay(min = 1000, max = 3000) {
    const delay = Math.random() * (max - min) + min;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  // Simulate human reading behavior
  async simulateReading(page) {
    // Scroll slightly as if reading
    await page.evaluate(() => {
      window.scrollBy(0, Math.random() * 200 + 100);
    });

    // Random reading time
    await this.randomDelay(2000, 4000);

    // Maybe scroll back up a bit
    if (Math.random() > 0.7) {
      await page.evaluate(() => {
        window.scrollBy(0, -(Math.random() * 100 + 50));
      });
      await this.randomDelay(500, 1000);
    }
  }

  async setupHumanBrowser() {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled",
        "--disable-features=VizDisplayCompositor",
        "--window-size=1366,768",
        "--start-maximized",
      ],
      defaultViewport: null, // Use actual window size
    });

    const page = await browser.newPage();

    // Remove automation indicators
    await page.evaluateOnNewDocument(() => {
      // Remove webdriver property
      Object.defineProperty(navigator, "webdriver", {
        get: () => undefined,
      });

      // Add realistic properties
      window.chrome = {
        runtime: {},
        app: {},
        csi: {},
        loadTimes: () => {},
      };

      // Override plugins
      Object.defineProperty(navigator, "plugins", {
        get: () => [
          { name: "Chrome PDF Plugin" },
          { name: "Shockwave Flash" },
          { name: "Chromium PDF Plugin" },
        ],
      });

      // Realistic languages
      Object.defineProperty(navigator, "languages", {
        get: () => ["en-US", "en"],
      });

      // Mock media devices
      Object.defineProperty(navigator, "mediaDevices", {
        get: () => ({
          enumerateDevices: () =>
            Promise.resolve([
              { kind: "videoinput", label: "FaceTime HD Camera" },
              { kind: "audioinput", label: "Built-in Microphone" },
            ]),
        }),
      });
    });

    // Set realistic user agent
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    // Add realistic headers
    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    });

    return { browser, page };
  }

  generateDateRange(days = 7) {
    const dates = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const formatted = date.toISOString().split("T")[0];
      dates.push(formatted);
    }

    return dates;
  }

  async scrapeMovies() {
    let browser, page;

    try {
      const result = await this.setupHumanBrowser();
      browser = result.browser;
      page = result.page;

      const dates = this.generateDateRange(7);
      const allEvents = [];

      console.log(
        `🎭 Starting human-like scraping for ${dates.length} dates...`
      );

      // Process each date by navigating directly to the URL
      for (let i = 0; i < dates.length; i++) {
        const date = dates[i];
        console.log(`\n📅 Processing date ${i + 1}/${dates.length}: ${date}`);

        // Navigate directly to the date-specific URL
        const url = `${this.baseUrl}?date=${date}`;
        console.log(`🎭 Navigating to: ${url}`);

        try {
          await page.goto(url, { waitUntil: "domcontentloaded" });

          // Wait longer for Squarespace/bot protection to finish
          console.log(
            `⏳ Waiting for page to fully load (Squarespace protection)...`
          );
          await this.randomDelay(5000, 8000);

          // Check if we're still in "establishing connection" state
          const needsMoreTime = await page.evaluate(() => {
            const bodyText = document.body.innerText.toLowerCase();
            return (
              bodyText.includes("establishing") ||
              bodyText.includes("secure connection") ||
              bodyText.includes("loading") ||
              document.body.innerText.length < 500
            ); // Very short content suggests still loading
          });

          if (needsMoreTime) {
            console.log(`🔄 Page still loading, waiting longer...`);
            await this.randomDelay(8000, 12000);
          }

          // Check for CAPTCHA on this page
          const isCaptcha = await page.evaluate(() => {
            const url = window.location.href;
            const title = document.title;
            const bodyText = document.body ? document.body.innerText : "";

            return (
              url.includes("sgcaptcha") ||
              title.includes("Robot Challenge") ||
              bodyText.includes("challenge") ||
              bodyText.includes("Checking your browser") ||
              bodyText.includes("Please wait") ||
              url.includes("cloudflare")
            );
          });

          if (isCaptcha) {
            console.log(`🤖 CAPTCHA detected on ${date} - skipping this date`);
            continue;
          }

          // Check if we have content for this date
          const hasContent = await page.evaluate(() => {
            return document.querySelectorAll(".col-md-12.col-lg-6").length > 0;
          });

          if (!hasContent) {
            console.log(
              `⚠️  No movie content found for ${date} - might still be loading`
            );

            // Try waiting a bit more and check again
            await this.randomDelay(3000, 5000);
            const hasContentAfterWait = await page.evaluate(() => {
              return (
                document.querySelectorAll(".col-md-12.col-lg-6").length > 0
              );
            });

            if (!hasContentAfterWait) {
              console.log(
                `⚠️  Still no content after additional wait, skipping ${date}`
              );
              continue;
            }
          }

          // Simulate human reading behavior
          await this.simulateReading(page);

          // Extract movie data for current date
          const movieData = await page.evaluate(() => {
            const movies = [];

            // Look for movie containers
            const movieContainers = document.querySelectorAll(
              ".col-md-12.col-lg-6"
            );

            movieContainers.forEach((container) => {
              const movieContainer =
                container.querySelector(".at-np-container");
              if (!movieContainer) return;

              const titleEl = movieContainer.querySelector("h2 a");
              if (!titleEl) return;

              const title = titleEl.textContent.trim();

              const posterEl = movieContainer.querySelector("img");
              const posterUrl = posterEl?.src || "";

              const ratingEl = movieContainer.querySelector(".at-mpaa");
              const rating = ratingEl?.textContent.trim() || "Not Rated";

              const durationEl = movieContainer.querySelector(
                ".at-dur .at-content"
              );
              const duration = durationEl?.textContent.trim() || "";

              // Extract showtimes
              const times = [];
              const timesContainer = movieContainer.querySelector(
                ".at-np-details-times"
              );
              if (timesContainer) {
                const timeElements = timesContainer.querySelectorAll(
                  "ul li span:first-child"
                );
                timeElements.forEach((timeEl) => {
                  const text = timeEl.textContent.trim();
                  if (text.match(/\d{1,2}:\d{2}\s*(AM|PM)/i)) {
                    times.push(text);
                  }
                });
              }

              const hasSpecial = !!movieContainer.querySelector(
                ".signs .fas.fa-star"
              );

              if (title && times.length > 0) {
                movies.push({
                  title,
                  originalTitle: title,
                  posterUrl,
                  duration,
                  times,
                  hasSpecialScreening: hasSpecial,
                });
              }
            });

            return movies;
          });

          console.log(`✅ Found ${movieData.length} movies for ${date}`);

          // Process the movie data
          movieData.forEach((movie) => {
            const accessibility = [];
            const discount = [];

            if (movie.hasSpecialScreening) {
              discount.push("Special Screening");
            }

            allEvents.push({
              date,
              title: movie.title,
              originalTitle: movie.originalTitle,
              times: movie.times,
              format: "Digital",
              imageUrl: movie.posterUrl,
              ariaLabel: "",
              theatre: this.theatreName,
              accessibility: accessibility.length > 0 ? accessibility : [],
              discount: discount.length > 0 ? discount : [],
              duration: movie.duration,
            });
          });
        } catch (pageError) {
          console.log(
            `⚠️  Error loading page for ${date}: ${pageError.message}`
          );
          continue;
        }

        // Human-like pause between page loads (longer to respect Squarespace)
        if (i < dates.length - 1) {
          console.log(
            `⏳ Pausing before next date (respecting rate limits)...`
          );
          await this.randomDelay(8000, 15000); // Longer pause to avoid triggering protection
        }
      }

      return allEvents.sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.title.localeCompare(b.title);
      });
    } catch (error) {
      console.error(`💥 Error in scrapeMovies: ${error.message}`);
      throw error;
    } finally {
      // Only close browser at the very end
      if (browser) {
        try {
          await this.randomDelay(1000, 2000);
          await browser.close();
        } catch (closeError) {
          console.log(`⚠️  Error closing browser: ${closeError.message}`);
        }
      }
    }
  }

  async saveToDatabase(events: any[]) {
    // First, delete existing Cinema 21 events to avoid duplicates
    await prisma.movieEvent.deleteMany({
      where: {
        theatre: this.theatreName,
      },
    });

    // Save new events
    let savedCount = 0;
    for (const event of events) {
      try {
        await prisma.movieEvent.create({
          data: event,
        });
        savedCount++;
      } catch (error: any) {
        console.error(`✗ Failed to save ${event.title}:`, {
          error: error.message,
          code: error.code,
          meta: error.meta,
          eventData: JSON.stringify(event, null, 2),
        });
      }
    }

    return savedCount;
  }
}

// Run the scraper
async function run() {
  const scraper = new HumanLikeAcademyScraper();
  try {
    const movieData = await scraper.scrapeMovies();
    if (movieData.length > 0) {
      // Save to database
      const savedCount = await scraper.saveToDatabase(movieData);
      // Show summary
      console.log("\n📈 Summary:");
      console.log(`- Events scraped: ${movieData.length}`);
      console.log(`- Events saved: ${savedCount}`);
      console.log(`- Theatre: ${scraper.theatreName}`);
    } else {
      console.log("⚠️  No events found to save");
    }

    // Show sample data
    if (movieData.length > 0) {
      console.log("\n--- SAMPLE DATA ---");
      console.log(JSON.stringify(movieData.slice(0, 2), null, 2));
    }
  } catch (error) {
    console.error("💥 Error:", error.message);
  }
}

export { HumanLikeAcademyScraper, run as runAcademyScraper };
