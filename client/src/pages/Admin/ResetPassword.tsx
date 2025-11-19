import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Link,
} from "@mui/material";
import { LockReset } from "@mui/icons-material";
import { AuthService } from "@/services/authService";
import { useNavigate, useSearchParams } from "react-router-dom";

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      setError("Invalid reset link. Please request a new password reset.");
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handleChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setPasswords((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
      setError("");
    };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!passwords.newPassword || !passwords.confirmPassword) {
      setError("Please enter both password fields");
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (passwords.newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (!token) {
      setError("Invalid reset link. Please request a new password reset.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const message = await AuthService.resetPassword(
        token,
        passwords.newPassword
      );
      setSuccess(message);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/auth");
      }, 2000);
    } catch (error: any) {
      setError(error.message || "Failed to reset password");
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
        bgcolor: "grey.100",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 400,
          textAlign: "center",
        }}
      >
        <LockReset sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />

        <Typography variant="h4" component="h1" gutterBottom>
          Reset Password
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Enter your new password
        </Typography>

        {!token ? (
          <Box>
            <Alert severity="error" sx={{ mb: 2 }}>
              Invalid reset link. Please request a new password reset.
            </Alert>
            <Link
              component="button"
              type="button"
              variant="body2"
              onClick={() => navigate("/forgot-password")}
              sx={{ cursor: "pointer" }}
            >
              Request New Reset Link
            </Link>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              name="newPassword"
              label="New Password"
              type="password"
              id="newPassword"
              autoComplete="new-password"
              autoFocus
              value={passwords.newPassword}
              onChange={handleChange("newPassword")}
              disabled={isLoading || !!success}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              value={passwords.confirmPassword}
              onChange={handleChange("confirmPassword")}
              disabled={isLoading || !!success}
            />

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mt: 2 }}>
                {success} Redirecting to login...
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading || !!success}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </Button>

            <Link
              component="button"
              type="button"
              variant="body2"
              onClick={() => navigate("/auth")}
              sx={{ cursor: "pointer" }}
              disabled={isLoading}
            >
              Back to Login
            </Link>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ResetPassword;
