import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import { AuthService } from "@/services/authService";
import useSessionStore from "@/stores/sessionStore";

const MagicLinkVerify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setAuthenticated = useSessionStore((state) => state.setAuthenticated);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setError("No token found in this link.");
      return;
    }

    AuthService.verifyMagicLink(token)
      .then(() => {
        setAuthenticated(true);
        navigate("/admin", { replace: true });
      })
      .catch((err) => {
        setError(err.message || "This link is invalid or has expired.");
      });
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        bgcolor: "#080808",
        flexDirection: "column",
        gap: 3,
      }}
    >
      <Typography
        sx={{
          fontFamily: "Antonio, sans-serif",
          fontSize: "11px",
          letterSpacing: "0.36em",
          textTransform: "uppercase",
          color: "#c9a84c",
        }}
      >
        Dr. Movie Times M.D.
      </Typography>

      {error ? (
        <>
          <Typography
            sx={{
              fontFamily: "Antonio, sans-serif",
              fontSize: "28px",
              fontWeight: 700,
              color: "#f0f0f0",
            }}
          >
            Link expired
          </Typography>
          <Typography
            sx={{ fontFamily: "Lato, sans-serif", fontSize: "15px", color: "#555" }}
          >
            {error}
          </Typography>
          <Typography
            onClick={() => navigate("/auth")}
            sx={{
              fontFamily: "Antonio, sans-serif",
              fontSize: "11px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#383838",
              cursor: "pointer",
              mt: 2,
              "&:hover": { color: "#c9a84c" },
            }}
          >
            ← Request a new link
          </Typography>
        </>
      ) : (
        <>
          <CircularProgress size={24} sx={{ color: "#c9a84c" }} />
          <Typography
            sx={{ fontFamily: "Lato, sans-serif", fontSize: "14px", color: "#555" }}
          >
            Signing you in…
          </Typography>
        </>
      )}
    </Box>
  );
};

export default MagicLinkVerify;
