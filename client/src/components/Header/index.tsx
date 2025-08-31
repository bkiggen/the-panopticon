import { Box, Button, Typography, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { AuthService } from "@/services/authService";
import useSessionStore from "@/stores/sessionStore";
import { routeConstants } from "@/routing/routeConstants";
export const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, clearSession } = useSessionStore();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const handleLogout = () => {
    AuthService.logout();
    clearSession();
    navigate(routeConstants.HOME);
  };

  return (
    <>
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
              size="small"
            >
              <Typography variant="h6">Home</Typography>
            </Button>
            <Button
              variant="text"
              onClick={() => navigate(routeConstants.ADMIN)}
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

      {/* Main header */}
      <Box sx={{ backgroundColor: isDarkMode ? "black" : "white" }}>
        <header
          style={{
            backgroundImage: isDarkMode
              ? `url(/panopticon-dark.png)`
              : `url(/panopticon.png)`,
            backgroundRepeat: "repeat-x",
            backgroundPosition: "-100px 0",
            backgroundSize: "300px auto",
            height: "90px",
          }}
        />
      </Box>
    </>
  );
};
