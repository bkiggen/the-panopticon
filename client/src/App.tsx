import { useState } from "react";
import AppRouter from "./routing/AppRouter";
import { ThemeProvider } from "@emotion/react";
import { Box, CssBaseline } from "@mui/material";
import { createAppTheme, ThemeMode } from "./utils/theme";
import { ThemeToggle } from "./components/ThemeToggle";

const App = () => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem("themeMode") as ThemeMode;
    const initialMode = saved || "dark";

    if (!saved) {
      localStorage.setItem("themeMode", initialMode);
    }
    return initialMode;
  });

  const theme = createAppTheme(themeMode);

  const toggleTheme = () => {
    setThemeMode((prev) => {
      const newMode = prev === "light" ? "dark" : "light";
      localStorage.setItem("themeMode", newMode);
      return newMode;
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box>
        <AppRouter />
        <ThemeToggle isDark={themeMode === "dark"} onToggle={toggleTheme} />
      </Box>
    </ThemeProvider>
  );
};

export default App;
