// Hollywood Theater Browser Console Scraper
// Navigate to https://hollywoodtheatre.org/# first, then run this in the console

class HollywoodBrowserScraper {
  constructor() {
    this.theatreName = "Hollywood Theater";
    this.allEvents = [];
  }

  // Random delay to simulate human behavior
  async delay(min = 1000, max = 3000) {
    const delay = Math.random() * (max - min) + min;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  // Get current month name from calendar
  getCurrentMonthName() {
    const titleElement = document.querySelector(".fc-toolbar-title");
    return titleElement ? titleElement.textContent.trim() : null;
  }

  // Clean movie title (remove "in 35mm", etc.)
  cleanTitle(title) {
    return title
      .replace(/\s+in\s+(35mm|16mm|70mm)$/i, "")
      .replace(/\s+with\s+.+$/i, "") // Remove "with [person]"
      .trim();
  }

  // Check for special features
  getMovieFeatures(title) {
    const features = [];
    if (/in\s+(35mm|16mm|70mm)/i.test(title)) {
      const match = title.match(/in\s+(35mm|16mm|70mm)/i);
      features.push(`${match[1]} Film`);
    }
    if (/with\s+.+$/i.test(title)) {
      features.push("Special Guest");
    }
    return features;
  }

  // Scrape calendar data from current view
  scrapeCurrentCalendarData() {
    console.log(`📊 Extracting calendar data...`);

    const events = [];

    // Try multiple selectors for movie events
    const eventSelectors = [
      ".fc-daygrid-event",
      ".fc-event",
      ".fc-gecko-event-item",
      '[class*="event"]',
      "[data-date] .fc-event",
    ];

    let movieEvents = [];
    for (const selector of eventSelectors) {
      movieEvents = document.querySelectorAll(selector);
      if (movieEvents.length > 0) {
        console.log(
          `Found ${movieEvents.length} events using selector: ${selector}`
        );
        break;
      }
    }

    if (movieEvents.length === 0) {
      console.log("❌ No movie events found with any selector");
      return [];
    }

    movieEvents.forEach((eventEl, index) => {
      try {
        // Get the date from the parent cell or data attribute
        let date = null;

        // Try different ways to get the date
        const dateCell = eventEl.closest("[data-date]");
        if (dateCell) {
          date = dateCell.getAttribute("data-date");
        } else {
          // Try to find date in parent elements
          let parent = eventEl.parentElement;
          while (parent && !date) {
            if (parent.hasAttribute("data-date")) {
              date = parent.getAttribute("data-date");
              break;
            }
            parent = parent.parentElement;
          }
        }

        if (!date) {
          console.log(`No date found for event ${index}`);
          return;
        }

        // Extract movie info from the event
        const eventItem =
          eventEl.querySelector(".fc-gecko-event-item") || eventEl;

        const titleEl =
          eventItem.querySelector(".fc-gecko-event-item__title") ||
          eventItem.querySelector(".fc-event-title") ||
          eventItem.querySelector('[class*="title"]') ||
          eventItem;

        if (!titleEl) {
          console.log(`No title found for event ${index}`);
          return;
        }

        const title = titleEl.textContent.trim();
        if (!title) {
          console.log(`Empty title for event ${index}`);
          return;
        }

        // Extract showtimes
        const times = [];
        const timesContainer =
          eventItem.querySelector(".fc-gecko-event-item__details") ||
          eventItem.querySelector('[class*="details"]') ||
          eventItem;

        if (timesContainer) {
          const timeSpans = timesContainer.querySelectorAll("span");
          timeSpans.forEach((span) => {
            const timeText = span.textContent.trim();
            if (timeText.match(/\d{1,2}:\d{2}(am|pm)/i)) {
              times.push(timeText);
            }
          });
        }

        // Extract image URL from background-image style
        let imageUrl = "";
        const imageEl =
          eventItem.querySelector(".fc-gecko-event-item__image") ||
          eventItem.querySelector('[style*="background-image"]');

        if (imageEl) {
          const bgImage = imageEl.style.backgroundImage;
          const match = bgImage.match(/url\(["']?(.+?)["']?\)/);
          if (match) {
            imageUrl = match[1];
          }
        }

        console.log(
          `Processing event: ${title} on ${date} with ${times.length} times`
        );

        if (title) {
          events.push({
            date,
            title,
            times,
            imageUrl,
          });
        }
      } catch (error) {
        console.log(`Error processing event ${index}:`, error);
      }
    });

    console.log(`✅ Found ${events.length} movie events on current view`);
    return events;
  }

  // Click next month button
  async clickNextMonth() {
    const nextButton = document.querySelector(".fc-next-button");
    if (nextButton) {
      nextButton.click();
      console.log(`🖱️  Clicked Next Month button`);
      return true;
    } else {
      console.log(`❌ Next month button not found`);
      return false;
    }
  }

  // Transform events to standard format
  transformEvents(events) {
    return events.map((movie) => {
      const cleanedTitle = this.cleanTitle(movie.title);
      const features = this.getMovieFeatures(movie.title);

      return {
        date: movie.date,
        title: cleanedTitle,
        originalTitle: movie.title,
        times: movie.times,
        format: features.includes("35mm Film")
          ? "35mm"
          : features.includes("16mm Film")
          ? "16mm"
          : features.includes("70mm Film")
          ? "70mm"
          : "Digital",
        imageUrl: movie.imageUrl,
        ariaLabel: "",
        theatre: this.theatreName,
        accessibility: null,
        discount: features.includes("Special Guest") ? ["Special Guest"] : null,
        rating: "",
        duration: "",
        movieUrl: "",
      };
    });
  }

  // Main scraping function
  async scrapeMovies() {
    console.log(`🎭 Starting Hollywood Theater browser scraper...`);

    // First, make sure we're in calendar view
    console.log(`🖱️  Ensuring calendar view is active...`);

    // Try to click Calendar button if it exists
    const calendarButtons = Array.from(
      document.querySelectorAll("button")
    ).filter((btn) => {
      const span = btn.querySelector("span");
      return span && span.textContent.trim() === "Calendar";
    });

    if (calendarButtons.length > 0) {
      calendarButtons[0].click();
      console.log(`✅ Clicked Calendar button`);
      await this.delay(3000, 5000);
    }

    // Make sure we're in month view
    const monthButton = document.querySelector(".fc-dayGridMonth-button");
    if (monthButton) {
      monthButton.click();
      console.log(`✅ Clicked Month view button`);
      await this.delay(2000, 3000);
    }

    // Get initial month name
    let currentMonthName = this.getCurrentMonthName();
    console.log(`📅 Starting month: ${currentMonthName}`);

    // Scrape current month and next 3 months (4 total)
    for (let monthIndex = 0; monthIndex < 4; monthIndex++) {
      console.log(
        `\n📅 Scraping month ${monthIndex + 1}/4: ${currentMonthName}`
      );

      // Wait for calendar data to load
      await this.delay(2000, 4000);

      try {
        const monthData = this.scrapeCurrentCalendarData();
        this.allEvents.push(...monthData);
      } catch (error) {
        console.log(
          `⚠️  Error scraping month ${monthIndex + 1}: ${error.message}`
        );
      }

      // Click next month button (except for the last iteration)
      if (monthIndex < 3) {
        const previousMonthName = currentMonthName;

        console.log(`🖱️  Moving to next month...`);
        const clicked = await this.clickNextMonth();

        if (!clicked) {
          console.log(`❌ Could not click next month button. Stopping.`);
          break;
        }

        // Wait for calendar to update
        await this.delay(4000, 6000);

        // Check if month actually changed
        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts) {
          currentMonthName = this.getCurrentMonthName();

          if (currentMonthName && currentMonthName !== previousMonthName) {
            console.log(
              `✅ Month changed from "${previousMonthName}" to "${currentMonthName}"`
            );
            break;
          } else {
            attempts++;
            console.log(
              `⚠️  Month hasn't changed yet (attempt ${attempts}/${maxAttempts}). Current: "${currentMonthName}", Previous: "${previousMonthName}"`
            );

            if (attempts < maxAttempts) {
              // Try clicking next again
              await this.clickNextMonth();
              await this.delay(4000, 6000);
            }
          }
        }

        if (attempts >= maxAttempts) {
          console.log(
            `❌ Month did not change after ${maxAttempts} attempts. Stopping.`
          );
          break;
        }
      }
    }

    // Transform to standard format
    const transformedEvents = this.transformEvents(this.allEvents);

    // Sort by date then title
    const sortedEvents = transformedEvents.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.title.localeCompare(b.title);
    });

    console.log(`\n🎉 Successfully scraped ${sortedEvents.length} events`);

    // Show sample data
    if (sortedEvents.length > 0) {
      console.log("\n--- SAMPLE DATA ---");
      console.log(JSON.stringify(sortedEvents.slice(0, 3), null, 2));
    }

    return sortedEvents;
  }
}

// Usage instructions and runner
console.log(`
🎭 HOLLYWOOD THEATER BROWSER SCRAPER
=====================================

Instructions:
1. Navigate to: https://hollywoodtheatre.org/#
2. Wait for the page to fully load
3. Run this code in the browser console
4. The scraper will automatically switch to calendar view and scrape 4 months of data

Starting scraper in 3 seconds...
`);

function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Auto-run the scraper
setTimeout(async () => {
  try {
    const scraper = new HollywoodBrowserScraper();
    window.hollywoodData = await scraper.scrapeMovies();

    downloadJSON(window.hollywoodData, "hollywood-theater-movies.json");
    console.log("📁 File downloaded: hollywood-theater-movies.json");
  } catch (error) {
    console.error("💥 Scraping failed:", error);
  }
}, 1000);

// Helper function to download data
window.downloadHollywoodData = function () {
  if (window.hollywoodData) {
    copy(JSON.stringify(window.hollywoodData, null, 2));
    console.log("📋 Data copied to clipboard! Paste it into a file to save.");
  } else {
    console.log("❌ No data found. Run the scraper first.");
  }
};
