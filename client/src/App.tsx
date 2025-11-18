import { useState } from "react";
import AppRouter from "./routing/AppRouter";
import { ThemeProvider } from "@emotion/react";
import { Box, CssBaseline } from "@mui/material";
import { createAppTheme, ThemeMode } from "./utils/theme";
import { ThemeToggle } from "./components/ThemeToggle";
import { Toaster } from "react-hot-toast";
import ErrorBoundary from "./components/ErrorBoundary";

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
      <ErrorBoundary>
        <Box>
          <AppRouter />
          <ThemeToggle isDark={themeMode === "dark"} onToggle={toggleTheme} />
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: themeMode === "dark" ? "#333" : "#fff",
                color: themeMode === "dark" ? "#fff" : "#333",
              },
              success: {
                iconTheme: {
                  primary: "#4caf50",
                  secondary: "#fff",
                },
              },
              error: {
                iconTheme: {
                  primary: "#f44336",
                  secondary: "#fff",
                },
              },
            }}
          />
        </Box>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default App;
