import { Box, Button } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthService } from "@/services/authService";
import useSessionStore from "@/stores/sessionStore";
import { routeConstants } from "@/routing/routeConstants";

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, clearSession } = useSessionStore();

  const handleLogout = () => {
    AuthService.logout();
    clearSession();
    navigate(routeConstants.HOME);
  };

  const handleAdminClick = () => {
    if (isAuthenticated) {
      navigate(routeConstants.ADMIN);
    } else {
      navigate(routeConstants.AUTH);
    }
  };

  return (
    <Box>
      <header
        style={{
          backgroundImage: `url(/panopticon.png)`,
          backgroundRepeat: "repeat-x",
          backgroundPosition: "-100px 0",
          backgroundSize: "300px auto",
          height: "90px",
        }}
      />

      {/* Admin controls positioned over the header */}
      <Box
        sx={{
          position: "fixed",
          bottom: 8,
          right: 16,
          display: "flex",
          gap: 1,
        }}
      >
        {isAuthenticated && (
          <Button
            variant="outlined"
            onClick={handleLogout}
            size="small"
            sx={{
              backgroundColor: "#09507dff",
              opacity: 0.7,
              color: "white",
              "&:hover": { backgroundColor: "#042940" },
            }}
          >
            Logout
          </Button>
        )}
      </Box>
    </Box>
  );
};
