import { describe, it, expect } from "vitest";

// Simulate the problematic date parsing from the scraper
describe("Laurelhurst Scraper - Date Parsing", () => {
  // This is what the scraper currently does (BROKEN)
  const formatDateCurrent = (dateString: string) => {
    if (dateString.length === 8) {
      const year = dateString.substring(0, 4);
      const month = dateString.substring(4, 6);
      const day = dateString.substring(6, 8);
      return `${year}-${month}-${day}`;
    }
    return null;
  };

  const createDateObjectCurrent = (formattedDate: string) => {
    return new Date(formattedDate); // ← THE PROBLEM!
  };

  // This is what it SHOULD do (FIXED)
  const createDateObjectFixed = (formattedDate: string) => {
    // Parse the date string manually to avoid timezone issues
    const [year, month, day] = formattedDate.split("-");
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  };

  it("should demonstrate the timezone bug with current implementation", () => {
    const dateKey = "20251118"; // November 18, 2025
    const formatted = formatDateCurrent(dateKey);
    expect(formatted).toBe("2025-11-18");

    const dateObj = createDateObjectCurrent(formatted!);

    // The problem: new Date("2025-11-18") creates UTC midnight
    // In PST (UTC-8), this becomes November 17, 4pm
    console.log("Input date string:", formatted);
    console.log("Created Date object:", dateObj);
    console.log("ISO String:", dateObj.toISOString());
    console.log("Local String:", dateObj.toLocaleDateString());

    // This test will FAIL in PST timezone because the date shifts back a day
    // Uncomment the line below to see the failure:
    // expect(dateObj.getDate()).toBe(18); // Will be 17 in PST!
  });

  it("should fix the timezone issue with proper date construction", () => {
    const dateKey = "20251118"; // November 18, 2025
    const formatted = formatDateCurrent(dateKey);
    expect(formatted).toBe("2025-11-18");

    const dateObj = createDateObjectFixed(formatted!);

    console.log("\n=== FIXED VERSION ===");
    console.log("Input date string:", formatted);
    console.log("Created Date object:", dateObj);
    console.log("ISO String:", dateObj.toISOString());
    console.log("Local String:", dateObj.toLocaleDateString());

    // This WILL pass because we're creating a local date
    expect(dateObj.getDate()).toBe(18);
    expect(dateObj.getMonth()).toBe(10); // November (0-indexed)
    expect(dateObj.getFullYear()).toBe(2025);
  });

  it("should format date correctly for database storage", () => {
    const dateKey = "20251118";
    const formatted = formatDateCurrent(dateKey);
    const dateObj = createDateObjectFixed(formatted!);

    // When this goes to the database and comes back, it should still be Nov 18
    const isoString = dateObj.toISOString().split("T")[0];

    // In local timezone, this should be the correct date
    expect(dateObj.getDate()).toBe(18);
    expect(dateObj.getMonth()).toBe(10); // November
  });

  it("should handle multiple dates correctly", () => {
    const testDates = [
      { input: "20251117", expected: { day: 17, month: 10, year: 2025 } },
      { input: "20251118", expected: { day: 18, month: 10, year: 2025 } },
      { input: "20251119", expected: { day: 19, month: 10, year: 2025 } },
    ];

    testDates.forEach(({ input, expected }) => {
      const formatted = formatDateCurrent(input);
      const dateObj = createDateObjectFixed(formatted!);

      expect(dateObj.getDate()).toBe(expected.day);
      expect(dateObj.getMonth()).toBe(expected.month);
      expect(dateObj.getFullYear()).toBe(expected.year);
    });
  });
});

describe("Laurelhurst Scraper - Example scraped data", () => {
  it("should correctly parse the Keeper movie example", () => {
    // From the website HTML provided by the user:
    // <span class="movieListing_showdate" data-showdate="Tuesday, November 18th">Tuesday, November 18th</span>
    // This should be parsed as "20251118" internally

    const dateKey = "20251118";
    const formattedDate = dateKey.substring(0, 4) + "-" +
                         dateKey.substring(4, 6) + "-" +
                         dateKey.substring(6, 8);

    expect(formattedDate).toBe("2025-11-18");

    // Current (broken) way:
    const brokenDate = new Date(formattedDate);
    console.log("\nBroken date object:", brokenDate.toLocaleDateString());

    // Fixed way:
    const [year, month, day] = formattedDate.split("-");
    const fixedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    console.log("Fixed date object:", fixedDate.toLocaleDateString());

    expect(fixedDate.getDate()).toBe(18);
    expect(fixedDate.getMonth()).toBe(10); // November (0-indexed)
  });
});
