export const formatDate = (date: string | Date, isMobile: boolean) => {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: isMobile ? "short" : "long",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
};

export const hasValidImage = (imageUrl: string) => {
  return imageUrl && !imageUrl.includes("wp-content");
};
