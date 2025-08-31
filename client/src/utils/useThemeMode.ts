// utils/useThemeMode.ts
import { useState, useEffect } from "react";
import { ThemeMode } from "./theme";

export const useCurrentThemeMode = () => {
  const [mode, setMode] = useState<ThemeMode>("light");

  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem("themeMode") as ThemeMode;
      console.log("🚀 ~ handleStorage ~ saved:", saved);
      setMode(saved || "light");
    };

    handleStorage(); // Initial load
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return mode;
};
