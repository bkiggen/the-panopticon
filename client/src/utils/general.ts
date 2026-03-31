import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export const formatDate = (date: string | Date, isMobile: boolean) => {
  // Extract just the date part (YYYY-MM-DD) to avoid timezone conversion issues
  // Dates from the server are stored as UTC midnight but represent local dates
  let dateStr: string;

  if (typeof date === "string") {
    // If it's a string like "2026-04-01T00:00:00.000Z", take just the date part
    dateStr = date.split("T")[0];
  } else {
    // If it's a Date object, get the UTC date (not local date)
    const d = new Date(date);
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    dateStr = `${year}-${month}-${day}`;
  }

  // Parse as UTC to prevent timezone shifts
  return dayjs.utc(dateStr).format(isMobile ? "ddd, MMM D" : "dddd, MMM D");
};

export const hasValidImage = (imageUrl: string) => {
  return imageUrl && !imageUrl.includes("wp-content");
};

export const getBestData = (eventValue: any, movieDataValue: any) => {
  if (Array.isArray(eventValue) && eventValue.length === 0) {
    eventValue = null;
  }
  return eventValue || movieDataValue || null;
};
