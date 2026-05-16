import AppRouter from "./routing/AppRouter";
import { ThemeProvider } from "@emotion/react";
import { Box, CssBaseline } from "@mui/material";
import { createAppTheme } from "./utils/theme";
import { Toaster } from "react-hot-toast";
import ErrorBoundary from "./components/ErrorBoundary";

const theme = createAppTheme("dark");

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <Box>
          <AppRouter />
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: { background: "#333", color: "#fff" },
              success: {
                iconTheme: { primary: "#4caf50", secondary: "#fff" },
              },
              error: {
                iconTheme: { primary: "#f44336", secondary: "#fff" },
              },
            }}
          />
        </Box>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default App;
