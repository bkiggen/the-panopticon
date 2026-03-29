/**
 * Shared browser utilities for Puppeteer-based scrapers
 */
import puppeteer, { Browser, Page } from "puppeteer";

export interface BrowserSetupResult {
  browser: Browser;
  page: Page;
}

export interface BrowserOptions {
  headless?: boolean;
  timeout?: number;
  userAgent?: string;
}

const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

/**
 * Launch a basic Puppeteer browser instance
 * Suitable for sites without bot detection
 */
export async function launchBrowser(
  options: BrowserOptions = {}
): Promise<BrowserSetupResult> {
  const { headless = true, userAgent = DEFAULT_USER_AGENT } = options;

  const browser = await puppeteer.launch({
    headless,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setUserAgent(userAgent);

  return { browser, page };
}

/**
 * Launch a stealth browser with anti-detection measures
 * Suitable for sites with bot protection (Squarespace, Cloudflare, etc.)
 */
export async function launchStealthBrowser(
  options: BrowserOptions = {}
): Promise<BrowserSetupResult> {
  const { headless = true, userAgent = DEFAULT_USER_AGENT } = options;

  const browser = await puppeteer.launch({
    headless,
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

    // Add realistic Chrome properties
    (window as any).chrome = {
      runtime: {},
      app: {},
      csi: {},
      loadTimes: () => {},
    };

    // Override plugins to look realistic
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
  await page.setUserAgent(userAgent);

  // Add realistic headers
  await page.setExtraHTTPHeaders({
    "Accept-Language": "en-US,en;q=0.9",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  });

  return { browser, page };
}

/**
 * Safely close a browser instance
 */
export async function closeBrowser(browser: Browser | null): Promise<void> {
  if (browser) {
    try {
      await browser.close();
    } catch (error) {
      console.warn("Warning: Error closing browser:", (error as Error).message);
    }
  }
}

/**
 * Navigate to a URL with retry logic
 */
export async function navigateWithRetry(
  page: Page,
  url: string,
  options: {
    waitUntil?: "load" | "domcontentloaded" | "networkidle0" | "networkidle2";
    maxRetries?: number;
    retryDelay?: number;
  } = {}
): Promise<boolean> {
  const { waitUntil = "domcontentloaded", maxRetries = 3, retryDelay = 2000 } = options;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await page.goto(url, { waitUntil });
      return true;
    } catch (error) {
      console.warn(
        `Navigation attempt ${attempt}/${maxRetries} failed:`,
        (error as Error).message
      );
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }
  }

  return false;
}

/**
 * Check if page shows signs of bot detection/CAPTCHA
 */
export async function detectBotProtection(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const url = window.location.href;
    const title = document.title.toLowerCase();
    const bodyText = document.body?.innerText?.toLowerCase() || "";

    return (
      url.includes("sgcaptcha") ||
      url.includes("cloudflare") ||
      title.includes("robot") ||
      title.includes("challenge") ||
      bodyText.includes("checking your browser") ||
      bodyText.includes("please wait") ||
      bodyText.includes("challenge") ||
      bodyText.includes("captcha")
    );
  });
}

/**
 * Wait for page to be ready (content loaded, not just DOM)
 */
export async function waitForPageReady(
  page: Page,
  options: {
    minContentLength?: number;
    maxWaitMs?: number;
    checkIntervalMs?: number;
  } = {}
): Promise<boolean> {
  const {
    minContentLength = 500,
    maxWaitMs = 15000,
    checkIntervalMs = 1000,
  } = options;

  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitMs) {
    const contentLength = await page.evaluate(
      () => document.body?.innerText?.length || 0
    );

    if (contentLength >= minContentLength) {
      return true;
    }

    await new Promise((resolve) => setTimeout(resolve, checkIntervalMs));
  }

  return false;
}
