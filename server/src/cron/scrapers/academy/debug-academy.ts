import { launchStealthBrowser, closeBrowser } from "../utils";

async function debug() {
  const { browser, page } = await launchStealthBrowser();

  try {
    const url = "https://www.academytheaterpdx.com/movies/?date=2026-04-29";
    console.log(`🔗 Navigating to: ${url}`);

    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

    // Wait a bit for React
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Dismiss cookie consent
    const dismissed = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const agreeButton = buttons.find(
        (btn) =>
          btn.textContent?.toLowerCase().includes("agree") ||
          btn.textContent?.toLowerCase().includes("accept") ||
          btn.textContent?.toLowerCase().includes("close"),
      );

      if (agreeButton) {
        (agreeButton as HTMLButtonElement).click();
        return true;
      }
      return false;
    });

    console.log(`🍪 Cookie dialog dismissed: ${dismissed}`);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Check what's on the page
    const debug = await page.evaluate(() => {
      return {
        bodyLength: document.body.innerText.length,
        bodyPreview: document.body.innerText.substring(0, 500),
        movieLinksCount: document.querySelectorAll("a[href^='/movies/']")
          .length,
        bookingLinksCount: document.querySelectorAll(
          "a[href^='https://booking.academytheaterpdx.com/']",
        ).length,
        allLinksCount: document.querySelectorAll("a").length,
        hasImages: document.querySelectorAll("img").length,
        sampleMovieLinks: Array.from(
          document.querySelectorAll("a[href^='/movies/']"),
        )
          .slice(0, 3)
          .map((a) => ({
            href: (a as HTMLAnchorElement).href,
            title: a.getAttribute("title"),
            text: a.textContent?.substring(0, 50),
          })),
        sampleBookingLinks: Array.from(
          document.querySelectorAll(
            "a[href^='https://booking.academytheaterpdx.com/']",
          ),
        )
          .slice(0, 3)
          .map((a) => ({
            href: (a as HTMLAnchorElement).href,
            ariaLabel: a.getAttribute("aria-label"),
            text: a.textContent?.substring(0, 50),
          })),
      };
    });

    console.log("\n📊 Page Debug Info:");
    console.log(JSON.stringify(debug, null, 2));

    // Test the actual extraction logic
    console.log("\n🎬 Testing Movie Extraction:");
    const movies = await page.evaluate(() => {
      interface RawMovieData {
        title: string;
        originalTitle: string;
        posterUrl: string;
        duration: string;
        times: string[];
        ticketUrls: string[];
        detailUrl: string;
        hasSpecialScreening: boolean;
      }

      const movies: RawMovieData[] = [];
      const processedMovies = new Set<string>();

      // Find all movie links (stable selector)
      const movieLinks = document.querySelectorAll(
        "a[href^='/movies/']",
      ) as NodeListOf<HTMLAnchorElement>;

      movieLinks.forEach((movieLink) => {
        // Get title from stable attributes
        const title =
          movieLink.getAttribute("title")?.trim() ||
          movieLink.querySelector("img")?.getAttribute("alt")?.trim() ||
          "";

        if (!title || processedMovies.has(title)) return;

        // Build full detail URL
        const detailPath = movieLink.getAttribute("href") || "";
        const detailUrl = detailPath
          ? `https://www.academytheaterpdx.com${detailPath}`
          : "";

        // Extract poster image
        const posterEl = movieLink.querySelector("img") as HTMLImageElement;
        const posterUrl = posterEl?.src || "";

        // Find the nearest common ancestor that contains both movie info and showtimes
        let container = movieLink.parentElement;
        let showtimeLinks: NodeListOf<HTMLAnchorElement> | null = null;
        let maxLevels = 10;

        while (container && maxLevels > 0) {
          const links = container.querySelectorAll(
            "a[href^='https://booking.academytheaterpdx.com/']",
          ) as NodeListOf<HTMLAnchorElement>;

          if (links.length > 0) {
            showtimeLinks = links;
            break;
          }

          container = container.parentElement;
          maxLevels--;
        }

        // Extract showtimes with ticket URLs
        const times: Array<{ time: string; ticketUrl?: string }> = [];

        if (showtimeLinks) {
          showtimeLinks.forEach((link) => {
            const ariaLabel = link.getAttribute("aria-label")?.trim();
            const timeEl = link.querySelector("time");
            const timeText = ariaLabel || timeEl?.textContent?.trim() || "";
            const ticketUrl = link.href;

            if (timeText && ticketUrl) {
              times.push({
                time: timeText,
                ticketUrl: ticketUrl,
              });
            }
          });
        }

        // Only add if we have showtimes
        if (title && times.length > 0) {
          processedMovies.add(title);
          movies.push({
            title,
            originalTitle: title,
            posterUrl,
            duration: "",
            times: times.map((t) => t.time),
            hasSpecialScreening: false,
            detailUrl,
            ticketUrls: times.map((t) => t.ticketUrl || ""),
          });
        }
      });

      return movies;
    });

    console.log(`Found ${movies.length} movies:`);
    movies.forEach((movie, i) => {
      console.log(
        `\n${i + 1}. ${movie.title} (${movie.times.length} showtimes)`,
      );
      console.log(`   Detail URL: ${movie.detailUrl}`);
      console.log(`   Times: ${movie.times.join(", ")}`);
    });

    // Take a screenshot
    await page.screenshot({
      path: "/Users/benkiggen/Desktop/panopticon/debug-academy.png",
      fullPage: true,
    });
    console.log("\n📸 Screenshot saved to debug-academy.png");
  } finally {
    await closeBrowser(browser);
  }
}

debug().catch(console.error);
