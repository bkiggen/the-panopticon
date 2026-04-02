// utils/theme.ts
import { createTheme } from "@mui/material/styles";

export type ThemeMode = "light" | "dark";

export const createAppTheme = (mode: ThemeMode) => {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: mode === "light" ? "#FF6B3D" : "#FF8C5A",
        light: mode === "light" ? "#FF9D6B" : "#FFA578",
        dark: mode === "light" ? "#E74C3C" : "#F05A28",
        contrastText: "#fff",
      },
      secondary: {
        main: "#6B8AC9",
        light: "#8BA8D9",
        dark: "#5B7FBF",
        contrastText: "#fff",
      },
      background: {
        default: mode === "light" ? "#F5F7FA" : "#2C3E50",
        paper: mode === "light" ? "#ffffff" : "#34495E",
      },
      text: {
        primary: mode === "light" ? "#2C3E50" : "#ECF0F1",
        secondary: mode === "light" ? "#5B7FBF" : "#BDC3C7",
      },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: mode === "light" ? "#ffffff" : "#34495E",
            boxShadow: mode === "light" ? "0 2px 8px rgba(107,138,201,0.15)" : "0 2px 8px rgba(0,0,0,0.3)",
            border: mode === "light" ? "1px solid #6B8AC9" : "1px solid #5B7FBF",
            outline: "none",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              boxShadow:
                mode === "light" ? "0 4px 16px rgba(107,138,201,0.25)" : "0 4px 16px rgba(0,0,0,0.5)",
            },
          },
        },
      },
      MuiTypography: {
        styleOverrides: {
          root: {
            // fontFamily: "'Antonio', sans-serif",
          },
          h1: { fontFamily: "'Antonio', sans-serif" },
          h2: { fontFamily: "'Antonio', sans-serif" },
          h3: { fontFamily: "'Antonio', sans-serif" },
          h4: { fontFamily: "'Antonio', sans-serif" },
          h5: { fontFamily: "'Antonio', sans-serif" },
          h6: { fontFamily: "'Antonio', sans-serif" },
          body1: { fontFamily: "'Lato', sans-serif" },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            fontFamily: "'Lato', sans-serif",
            textTransform: "none",
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            fontFamily: "'Lato', sans-serif",
            "& .MuiInputBase-input": {
              fontFamily: "'Lato', sans-serif",
            },
            "& .MuiInputLabel-root": {
              fontFamily: "'Lato', sans-serif",
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontFamily: "'Lato', sans-serif",
            "& .MuiChip-label": {
              fontFamily: "'Lato', sans-serif",
            },
          },
        },
      },
    },
  });
};
