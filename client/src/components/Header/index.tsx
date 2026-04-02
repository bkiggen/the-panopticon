import { Box, Button, Typography, useTheme } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { AuthService } from "@/services/authService";
import useSessionStore from "@/stores/sessionStore";
import { routeConstants } from "@/routing/routeConstants";

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname: route } = location;
  const { isAuthenticated, clearSession } = useSessionStore();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  // CSS custom property approach for smooth scroll (only when not authenticated)
  useEffect(() => {
    // Don't run scroll animation when authenticated
    if (isAuthenticated) {
      document.documentElement.style.setProperty("--scroll-progress", "0");
      return;
    }

    const updateScrollProgress = () => {
      const scrolled = window.scrollY;
      const maxScroll = 200;
      const progress = Math.min(scrolled / maxScroll, 1);
      document.documentElement.style.setProperty(
        "--scroll-progress",
        progress.toString(),
      );
    };

    // Use requestAnimationFrame for smooth updates
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateScrollProgress();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    updateScrollProgress(); // Set initial value

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isAuthenticated]);

  const handleLogout = async () => {
    await AuthService.logout();
    await clearSession();
    navigate(routeConstants.HOME);
  };

  return (
    <Box sx={{ zIndex: 1000, position: "sticky", top: 0 }}>
      {isAuthenticated && (
        <Box
          sx={{
            backgroundColor: isDarkMode ? "#34495E" : "#6B8AC9",
            py: 1,
            px: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            height: 56,
          }}
        >
          {/* Navigation buttons */}
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="text"
              onClick={() => navigate(routeConstants.HOME)}
              sx={{ color: route === routeConstants.HOME ? "#FF6B3D" : "#fff" }}
              size="small"
            >
              <Typography variant="h6">Home</Typography>
            </Button>
            <Button
              variant="text"
              onClick={() => navigate(routeConstants.ADMIN)}
              sx={{
                color: route === routeConstants.ADMIN ? "#FF6B3D" : "#fff",
              }}
              size="small"
            >
              <Typography variant="h6">Admin</Typography>
            </Button>
          </Box>

          {/* Logout button */}
          <Button
            variant="outlined"
            onClick={handleLogout}
            size="small"
            sx={{
              color: "#fff",
              borderColor: "#fff",
              "&:hover": { backgroundColor: "#FF6B3D", borderColor: "#FF6B3D" },
            }}
          >
            <Typography variant="h6">Logout</Typography>
          </Button>
        </Box>
      )}

      {/* Main header with CSS custom property animation */}
      {isAuthenticated ? null : (
        <Box sx={{ backgroundColor: "#6B8AC9" }}>
          <Box
            component="header"
            sx={{
              backgroundImage: `url(/dr-movie-times.png)`,
              backgroundRepeat: "repeat-x",
              backgroundPosition: "center",
              backgroundSize: "auto 100%",
              height: "calc(120px - var(--scroll-progress, 0) * 60px)",
              overflow: "hidden",
              willChange: "height",
            }}
          />
        </Box>
      )}
    </Box>
  );
};
