import dayjs from "dayjs";

export const formatDate = (date: string | Date, isMobile: boolean) => {
  // Parse the date string directly to avoid timezone conversion issues
  // Showtimes are always in the local theater timezone, so we treat the date as-is
  const dateStr = typeof date === "string" ? date : date.toISOString().split("T")[0];
  return dayjs(dateStr).format(isMobile ? "ddd, MMM D" : "dddd, MMM D");
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
