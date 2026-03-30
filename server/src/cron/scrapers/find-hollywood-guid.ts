import puppeteer from "puppeteer";

/**
 * Script to find Hollywood Theatre's Agile Ticketing GUID
 * This will inspect network requests to find the feed URL
 */
async function findHollywoodGUID() {
  console.log("🔍 Searching for Hollywood Theatre Agile Ticketing GUID...\n");

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    // Track network requests
    const requests: string[] = [];
    page.on("request", (request) => {
      const url = request.url();
      if (
        url.includes("agileticketing") ||
        url.includes("websales") ||
        url.includes("feed.ashx") ||
        url.includes("guid=") ||
        url.includes("epguid=")
      ) {
        requests.push(url);
        console.log("📡 Found relevant request:", url);
      }
    });

    // Visit the main ticketing page
    console.log("📍 Visiting tickets.hollywoodtheatre.org...");
    await page.goto("https://tickets.hollywoodtheatre.org/", {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Extract any GUIDs from page content
    const guids = await page.evaluate(() => {
      const foundGuids: Array<{ context: string; guid: string }> = [];
      const guidRegex = /([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/gi;

      // Check page HTML
      const html = document.documentElement.outerHTML;
      const matches = html.match(guidRegex);

      if (matches) {
        matches.forEach((guid) => {
          // Find context around the GUID
          const index = html.indexOf(guid);
          const context = html.substring(Math.max(0, index - 50), index + guid.length + 50);
          foundGuids.push({ guid, context: context.replace(/\s+/g, " ") });
        });
      }

      // Check for feed URLs in links
      const links = Array.from(document.querySelectorAll("a, iframe"));
      links.forEach((link) => {
        const href = link.getAttribute("href") || link.getAttribute("src") || "";
        if (href.includes("guid=") || href.includes("epguid=")) {
          foundGuids.push({ guid: "URL: " + href, context: "" });
        }
      });

      return foundGuids;
    });

    console.log("\n📋 GUIDs found on page:");
    guids.forEach(({ guid, context }) => {
      console.log(`\n  GUID: ${guid}`);
      if (context && !guid.startsWith("URL:")) {
        console.log(`  Context: ${context.substring(0, 100)}...`);
      }
    });

    // Try visiting the showtimes page too
    console.log("\n📍 Visiting hollywoodtheatre.org/showtimes...");
    await page.goto("https://hollywoodtheatre.org/showtimes/", {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check for calendar/feed links
    const feedLinks = await page.evaluate(() => {
      const links: string[] = [];
      document.querySelectorAll("a, iframe").forEach((el) => {
        const href = el.getAttribute("href") || el.getAttribute("src") || "";
        if (
          href.includes("feed") ||
          href.includes("calendar") ||
          href.includes("ical") ||
          href.includes(".ics") ||
          href.includes("websales")
        ) {
          links.push(href);
        }
      });
      return links;
    });

    console.log("\n🔗 Feed/Calendar links found:");
    feedLinks.forEach((link) => console.log(`  ${link}`));

    console.log("\n📡 Network requests captured:");
    requests.forEach((req) => console.log(`  ${req}`));

    if (requests.length === 0 && guids.length === 0 && feedLinks.length === 0) {
      console.log("\n⚠️  No GUIDs or feed URLs found automatically.");
      console.log("💡 Try manually inspecting the page or checking browser devtools.");
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await browser.close();
  }
}

findHollywoodGUID();
