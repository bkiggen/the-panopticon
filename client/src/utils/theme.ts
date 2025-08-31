// utils/theme.ts
import { createTheme } from "@mui/material/styles";

export type ThemeMode = "light" | "dark";

export const createAppTheme = (mode: ThemeMode) => {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: mode === "light" ? "#000000" : "#ffffff",
        light: mode === "light" ? "#282828" : "#e0e0e0",
        dark: mode === "light" ? "#383838" : "#b0b0b0",
        contrastText: mode === "light" ? "#fff" : "#000",
      },
      secondary: {
        main: "#dc004e",
        light: "#ff5983",
        dark: "#9a0036",
        contrastText: "#fff",
      },
      background: {
        default: mode === "light" ? "#ffffff" : "#000000ff",
        paper: mode === "light" ? "#ffffff" : "#1a1a1a",
      },
      text: {
        primary: mode === "light" ? "#333333" : "#ffffff",
        secondary: mode === "light" ? "#666666" : "#b0b0b0",
      },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: mode === "light" ? "#ffffffff" : "#1a1a1a",
            boxShadow: mode === "light" ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
            border: mode === "light" ? "1px solid #444444" : "none",
            outline: "none",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              boxShadow:
                mode === "light" ? "0 4px 16px rgba(0,0,0,0.15)" : "none",
            },
          },
        },
      },
    },
  });
};
