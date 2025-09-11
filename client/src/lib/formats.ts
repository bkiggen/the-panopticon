export const formats = ["Digital", "16mm", "35mm", "70mm", "VHS"] as const;

export type Format = (typeof formats)[number];

export const isValidFormat = (format: string): format is Format => {
  return formats.includes(format as Format);
};

// For form dropdowns
export const formatOptions = formats.map((format) => ({
  label: format,
  value: format,
}));

// For filtering dropdowns (includes "All" option)
export const filterFormatOptions = [
  { label: "All", value: "All" },
  ...formatOptions,
];
