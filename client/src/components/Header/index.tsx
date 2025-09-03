import { Box, Button, Typography, useTheme } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { AuthService } from "@/services/authService";
import useSessionStore from "@/stores/sessionStore";
import { routeConstants } from "@/routing/routeConstants";
import { SponsorBox } from "./SponsorBox";

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname: route } = location;
  const { isAuthenticated, clearSession } = useSessionStore();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const userIsPatreonMember = true; // TODO: Replace with real check

  // CSS custom property approach for smooth scroll
  useEffect(() => {
    const updateScrollProgress = () => {
      const scrolled = window.scrollY;
      const maxScroll = 200;
      const progress = Math.min(scrolled / maxScroll, 1);
      document.documentElement.style.setProperty(
        "--scroll-progress",
        progress.toString()
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
  }, []);

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
            backgroundColor: isDarkMode ? "#1a1a1a" : "#f5f5f5",
            py: 1,
            px: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Navigation buttons */}
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="text"
              onClick={() => navigate(routeConstants.HOME)}
              sx={{ color: route === routeConstants.HOME ? "red" : "inherit" }}
              size="small"
            >
              <Typography variant="h6">Home</Typography>
            </Button>
            <Button
              variant="text"
              onClick={() => navigate(routeConstants.ADMIN)}
              sx={{
                color: route === routeConstants.ADMIN ? "red" : "inherit",
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
              "&:hover": { backgroundColor: "#042940" },
            }}
          >
            <Typography variant="h6">Logout</Typography>
          </Button>
        </Box>
      )}

      {/* Main header with CSS custom property animation */}
      <Box sx={{ backgroundColor: isDarkMode ? "black" : "white" }}>
        <Box
          component="header"
          sx={{
            backgroundImage: isDarkMode
              ? `url(/panopticon-dark.png)`
              : `url(/panopticon.png)`,
            backgroundRepeat: "repeat-x",
            backgroundPosition: "-100px -4px",
            backgroundSize: "300px auto",
            height: "calc(90px - var(--scroll-progress, 0) * 52px)",
            overflow: "hidden",
            willChange: "height",
          }}
        />
        {route === routeConstants.ADMIN || userIsPatreonMember ? null : (
          <SponsorBox />
        )}
      </Box>
    </Box>
  );
};
