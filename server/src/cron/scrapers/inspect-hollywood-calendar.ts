import puppeteer from "puppeteer";

async function inspectHollywoodCalendar() {
  console.log("🔍 Deep inspection of Hollywood Theatre calendar...\n");

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const allRequests: Array<{ url: string; type: string }> = [];

  // Capture ALL network requests
  page.on("request", (request) => {
    allRequests.push({
      url: request.url(),
      type: request.resourceType(),
    });
  });

  try {
    console.log("📍 Loading hollywoodtheatre.org/showtimes...\n");
    await page.goto("https://hollywoodtheatre.org/showtimes/", {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    await new Promise((resolve) => setTimeout(resolve, 3000));

    console.log("📡 All network requests made:\n");

    // Filter interesting requests
    const interesting = allRequests.filter((req) =>
      req.url.includes("agileticketing") ||
      req.url.includes("websales") ||
      req.url.includes("tickets.hollywood") ||
      req.url.includes(".ics") ||
      req.url.includes("calendar") ||
      req.url.includes("feed")
    );

    if (interesting.length > 0) {
      console.log("🎯 Interesting requests found:");
      interesting.forEach((req) => {
        console.log(`  [${req.type}] ${req.url}`);
      });
    } else {
      console.log("⚠️  No obviously interesting requests found.");
    }

    // Look for any JavaScript that might contain the feed URL or GUID
    console.log("\n🔎 Searching page content...\n");

    const pageContent = await page.evaluate(() => {
      const results: any = {};

      // Check all script tags
      const scripts = Array.from(document.querySelectorAll("script"));
      scripts.forEach((script, i) => {
        const content = script.textContent || "";
        if (
          content.includes("guid") ||
          content.includes("agiletix") ||
          content.includes("websales") ||
          content.includes("feed.ashx")
        ) {
          results[`script_${i}`] = content.substring(0, 500);
        }
      });

      // Check for data attributes
      const elementsWithData = Array.from(
        document.querySelectorAll("[data-guid], [data-feed], [data-calendar]")
      );
      results.dataElements = elementsWithData.map((el) => ({
        tag: el.tagName,
        attributes: Array.from(el.attributes).map((attr) => ({
          name: attr.name,
          value: attr.value,
        })),
      }));

      // Check for any iframes
      const iframes = Array.from(document.querySelectorAll("iframe"));
      results.iframes = iframes.map((iframe) => ({
        src: iframe.src,
        id: iframe.id,
        class: iframe.className,
      }));

      // Look for FullCalendar or similar calendar widgets
      results.calendarWidgets = Array.from(
        document.querySelectorAll('[class*="calendar"], [id*="calendar"], .fc-')
      ).map((el) => ({
        tag: el.tagName,
        id: el.id,
        class: el.className,
      }));

      return results;
    });

    console.log("📋 Page content analysis:");
    console.log(JSON.stringify(pageContent, null, 2));

    // Try to find the calendar initialization code
    const calendarConfig = await page.evaluate(() => {
      // Check window object for calendar-related properties
      const win = window as any;
      const keys = Object.keys(win);
      const calendarKeys = keys.filter(
        (key) =>
          key.includes("calendar") ||
          key.includes("fullcalendar") ||
          key.includes("FC") ||
          key.includes("agile")
      );
      return calendarKeys.map((key) => ({ key, type: typeof win[key] }));
    });

    if (calendarConfig.length > 0) {
      console.log("\n🔑 Calendar-related window properties:");
      console.log(JSON.stringify(calendarConfig, null, 2));
    }

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await browser.close();
  }
}

inspectHollywoodCalendar();
