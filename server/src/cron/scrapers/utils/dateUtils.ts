/**
 * Shared date utilities for scrapers
 */

/**
 * Generate an array of dates starting from today
 * @param days Number of days to generate (default: 7)
 * @returns Array of Date objects
 */
export function generateDateRange(days = 7): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  today.setHours(12, 0, 0, 0); // Set to noon to avoid timezone boundary issues

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date);
  }

  return dates;
}

/**
 * Format a Date object to YYYY-MM-DD string
 * @param date Date object to format
 * @returns Formatted date string
 */
export function formatDateToString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Create a Date object from a YYYY-MM-DD string without timezone issues
 * Avoids the bug where new Date("2025-11-18") interprets as UTC midnight
 * which can shift to the previous day in local time
 * @param dateString Date string in YYYY-MM-DD format
 * @returns Date object set to noon local time
 */
export function createDateFromString(dateString: string): Date {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12, 0, 0, 0);
  return date;
}

/**
 * Convert date string like "20250803" to Date object
 * @param dateString Date string in YYYYMMDD format
 * @returns Date object or null if invalid
 */
export function parseDateYYYYMMDD(dateString: string): Date | null {
  if (dateString.length !== 8) return null;

  const year = parseInt(dateString.substring(0, 4), 10);
  const month = parseInt(dateString.substring(4, 6), 10);
  const day = parseInt(dateString.substring(6, 8), 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

/**
 * Month name to number mapping
 */
const MONTH_MAP: Record<string, number> = {
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11,
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  sept: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};

/**
 * Parse a date string like "September 28" or "Sep 28"
 * @param monthName Month name (full or abbreviated)
 * @param day Day of month
 * @param year Optional year (defaults to current year, adjusts if date is in past)
 * @returns Date object or null if invalid
 */
export function parseMonthDay(
  monthName: string,
  day: string | number,
  year?: number
): Date | null {
  const monthNum = MONTH_MAP[monthName.toLowerCase()];
  const dayNum = typeof day === "string" ? parseInt(day, 10) : day;

  if (monthNum === undefined || isNaN(dayNum)) return null;

  const targetYear = year ?? new Date().getFullYear();
  const date = new Date(targetYear, monthNum, dayNum, 12, 0, 0, 0);

  // If no year provided and date is in the past, assume next year
  if (!year) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      date.setFullYear(targetYear + 1);
    }
  }

  return date;
}

/**
 * Parse time string like "7:30 PM" or "19:30"
 * @param timeStr Time string to parse
 * @returns Object with hours (24h), minutes, and original string, or null if invalid
 */
export function parseTime(
  timeStr: string
): { hours: number; minutes: number; formatted: string } | null {
  // Try 12-hour format first (7:30 PM)
  const time12Match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (time12Match) {
    let hours = parseInt(time12Match[1], 10);
    const minutes = parseInt(time12Match[2], 10);
    const ampm = time12Match[3].toUpperCase();

    if (ampm === "PM" && hours !== 12) {
      hours += 12;
    } else if (ampm === "AM" && hours === 12) {
      hours = 0;
    }

    return {
      hours,
      minutes,
      formatted: `${time12Match[1]}:${time12Match[2]} ${ampm}`,
    };
  }

  // Try 24-hour format (19:30)
  const time24Match = timeStr.match(/(\d{1,2}):(\d{2})/);
  if (time24Match) {
    const hours = parseInt(time24Match[1], 10);
    const minutes = parseInt(time24Match[2], 10);

    if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
      // Convert to 12-hour format for display
      const displayHours = hours % 12 || 12;
      const ampm = hours >= 12 ? "PM" : "AM";

      return {
        hours,
        minutes,
        formatted: `${displayHours}:${String(minutes).padStart(2, "0")} ${ampm}`,
      };
    }
  }

  return null;
}

/**
 * Extract duration from a string like "PG13 - 90min" or "90 minutes"
 * @param text Text containing duration
 * @returns Duration string like "90 min" or empty string
 */
export function extractDuration(text: string): string {
  const match = text?.match(/(\d+)\s*(?:min|minutes)/i);
  return match ? `${match[1]} min` : "";
}

/**
 * Check if a date is today or in the future
 * @param date Date to check
 * @returns True if date is today or future
 */
export function isDateTodayOrFuture(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate >= today;
}
