/**
 * Human-like behavior utilities for avoiding bot detection
 * Use these when scraping sites with aggressive bot protection
 */
import { Page } from "puppeteer";

/**
 * Wait for a random amount of time to simulate human behavior
 * @param minMs Minimum delay in milliseconds
 * @param maxMs Maximum delay in milliseconds
 */
export async function randomDelay(minMs = 1000, maxMs = 3000): Promise<void> {
  const delay = Math.random() * (maxMs - minMs) + minMs;
  await new Promise((resolve) => setTimeout(resolve, delay));
}

/**
 * Simulate human-like mouse movement between two points
 * Adds slight randomness to path to appear more natural
 */
export async function humanMouseMove(
  page: Page,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number
): Promise<void> {
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
    await randomDelay(10, 30);
  }
}

/**
 * Perform a human-like click on an element
 * Clicks slightly off-center like a human would
 */
export async function humanClick(page: Page, selector: string): Promise<void> {
  const element = await page.$(selector);
  if (!element) {
    throw new Error(`Element ${selector} not found`);
  }

  const box = await element.boundingBox();
  if (!box) {
    throw new Error(`Element ${selector} has no bounding box`);
  }

  // Click slightly off-center like a human would
  const offsetX = (Math.random() - 0.5) * (box.width * 0.3);
  const offsetY = (Math.random() - 0.5) * (box.height * 0.3);

  const clickX = box.x + box.width / 2 + offsetX;
  const clickY = box.y + box.height / 2 + offsetY;

  // Move mouse to element first
  await humanMouseMove(page, 100, 100, clickX, clickY);

  // Random delay before click
  await randomDelay(100, 300);

  await page.mouse.click(clickX, clickY);

  // Random delay after click
  await randomDelay(200, 500);
}

/**
 * Simulate human reading behavior with scrolling
 */
export async function simulateReading(page: Page): Promise<void> {
  // Scroll slightly as if reading
  await page.evaluate(() => {
    window.scrollBy(0, Math.random() * 200 + 100);
  });

  // Random reading time
  await randomDelay(2000, 4000);

  // Maybe scroll back up a bit (30% chance)
  if (Math.random() > 0.7) {
    await page.evaluate(() => {
      window.scrollBy(0, -(Math.random() * 100 + 50));
    });
    await randomDelay(500, 1000);
  }
}

/**
 * Scroll down the page in a human-like manner
 */
export async function humanScroll(
  page: Page,
  options: {
    scrolls?: number;
    minDelay?: number;
    maxDelay?: number;
  } = {}
): Promise<void> {
  const { scrolls = 3, minDelay = 500, maxDelay = 1500 } = options;

  for (let i = 0; i < scrolls; i++) {
    const scrollAmount = Math.floor(Math.random() * 300) + 200;

    await page.evaluate((amount) => {
      window.scrollBy(0, amount);
    }, scrollAmount);

    await randomDelay(minDelay, maxDelay);
  }
}

/**
 * Type text with human-like delays between keystrokes
 */
export async function humanType(
  page: Page,
  selector: string,
  text: string,
  options: {
    minDelay?: number;
    maxDelay?: number;
  } = {}
): Promise<void> {
  const { minDelay = 50, maxDelay = 150 } = options;

  await page.click(selector);
  await randomDelay(100, 300);

  for (const char of text) {
    await page.keyboard.type(char);
    await randomDelay(minDelay, maxDelay);
  }
}

/**
 * Wait for a random time that respects rate limits
 * Use between page loads to avoid triggering protection
 */
export async function respectRateLimit(
  options: {
    minSeconds?: number;
    maxSeconds?: number;
  } = {}
): Promise<void> {
  const { minSeconds = 8, maxSeconds = 15 } = options;
  await randomDelay(minSeconds * 1000, maxSeconds * 1000);
}
