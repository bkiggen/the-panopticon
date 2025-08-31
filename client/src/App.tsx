import { useState } from "react";
import AppRouter from "./routing/AppRouter";
import { ThemeProvider } from "@emotion/react";
import { Box, CssBaseline } from "@mui/material";
import { createAppTheme, ThemeMode } from "./utils/theme";
import { ThemeToggle } from "./components/ThemeToggle";

const App = () => {
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  const theme = createAppTheme(themeMode);

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === "light" ? "dark" : "light"));
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
