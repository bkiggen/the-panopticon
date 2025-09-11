export const accessibilityOptions = [
  "Open Captions",
  "Audio Description",
  "Wheelchair Accessible",
  "Assistive Listening Devices",
] as const;

export type AccessibilityOption = (typeof accessibilityOptions)[number];

export const isValidAccessibilityOption = (
  option: string
): option is AccessibilityOption => {
  return accessibilityOptions.includes(option as AccessibilityOption);
};

// For form dropdowns
export const accessibilityFormOptions = accessibilityOptions.map((option) => ({
  label: option,
  value: option,
}));

// For filtering dropdowns (includes "All" option)
export const filterAccessibilityOptions = [
  { label: "All", value: "All" },
  ...accessibilityFormOptions,
];
