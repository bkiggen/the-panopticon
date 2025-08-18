// theme.ts
import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#000000ff",
      light: "#282828ff",
      dark: "#383838ff",
      contrastText: "#fff",
    },
    secondary: {
      main: "#dc004e",
      light: "#ff5983",
      dark: "#9a0036",
      contrastText: "#fff",
    },
    success: {
      main: "#257134ff",
      light: "#80e27e",
    },
    info: {
      main: "#276baeff",
      light: "#63a4ff",
    },
    background: {
      default: "#ffffff",
      paper: "#ffffff",
    },
    text: {
      primary: "#333333",
      secondary: "#666666",
    },
  },
});
