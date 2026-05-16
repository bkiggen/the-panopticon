import React, { useState } from "react";
import { Box, Button, TextField, Typography, Alert, CircularProgress } from "@mui/material";
import { AuthService } from "@/services/authService";

interface LoginProps {
  onLoginSuccess: () => void;
}

const AdminLogin: React.FC<LoginProps> = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError("");

    try {
      await AuthService.requestMagicLink(email);
      setSent(true);
    } catch (err: any) {
      setError(err.message || "Failed to send login link");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        bgcolor: "#080808",
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 360, px: 3 }}>
        <Typography
          sx={{
            fontFamily: "Antonio, sans-serif",
            fontSize: "11px",
            letterSpacing: "0.36em",
            textTransform: "uppercase",
            color: "#c9a84c",
            mb: 4,
          }}
        >
          Dr. Movie Times M.D.
        </Typography>

        {sent ? (
          <>
            <Typography
              sx={{
                fontFamily: "Antonio, sans-serif",
                fontSize: "32px",
                fontWeight: 700,
                color: "#f0f0f0",
                lineHeight: 1,
                mb: 2,
              }}
            >
              Check your email
            </Typography>
            <Typography sx={{ fontFamily: "Lato, sans-serif", fontSize: "15px", color: "#555", lineHeight: 1.7 }}>
              A login link has been sent to <span style={{ color: "#888" }}>{email}</span>. Click it to sign in — it's good for 7 days.
            </Typography>
          </>
        ) : (
          <>
            <Typography
              sx={{
                fontFamily: "Antonio, sans-serif",
                fontSize: "32px",
                fontWeight: 700,
                color: "#f0f0f0",
                lineHeight: 1,
                mb: 2,
              }}
            >
              Sign in
            </Typography>
            <Typography sx={{ fontFamily: "Lato, sans-serif", fontSize: "15px", color: "#555", lineHeight: 1.7, mb: 4 }}>
              Enter your email and we'll send you a login link.
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                disabled={isLoading}
                autoFocus
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#0e0e0e",
                    "& fieldset": { borderColor: "#222" },
                    "&:hover fieldset": { borderColor: "#333" },
                    "&.Mui-focused fieldset": { borderColor: "#c9a84c" },
                  },
                  "& input": { color: "#f0f0f0", fontFamily: "Lato, sans-serif" },
                }}
              />

              {error && (
                <Alert severity="error" sx={{ mb: 2, bgcolor: "#1a0a0a", color: "#f44336" }}>
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                fullWidth
                disabled={isLoading || !email}
                sx={{
                  py: 1.5,
                  backgroundColor: "#c9a84c",
                  color: "#080808",
                  fontFamily: "Antonio, sans-serif",
                  fontSize: "13px",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  borderRadius: 0,
                  "&:hover": { backgroundColor: "#d4b86a" },
                  "&:disabled": { backgroundColor: "#222", color: "#444" },
                }}
              >
                {isLoading ? <CircularProgress size={18} sx={{ color: "#080808" }} /> : "Send Login Link"}
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default AdminLogin;
