import { useEffect, useState } from "react";
import useSessionStore from "@/stores/sessionStore";
import { useNavigate } from "react-router-dom";
import { Grid, Button, Box, Typography } from "@mui/material";

const PayphoneAuth = () => {
  const [code, setCode] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const { login, isAuthenticated } = useSessionStore();
  const navigate = useNavigate();

  // Get the correct code from environment variable
  const correctCode = import.meta.env.VITE_AUTH_CODE;

  const digits = [
    { num: "1", letters: "" },
    { num: "2", letters: "ABC" },
    { num: "3", letters: "DEF" },
    { num: "4", letters: "GHI" },
    { num: "5", letters: "JKL" },
    { num: "6", letters: "MNO" },
    { num: "7", letters: "PQRS" },
    { num: "8", letters: "TUV" },
    { num: "9", letters: "WXYZ" },
    { num: "*", letters: "" },
    { num: "0", letters: "" },
    { num: "#", letters: "" },
  ];

  const handleDigitPress = (digit: string) => {
    const newCode = code + digit;
    setCode(newCode);

    // Check if the entered sequence contains the correct code
    if (newCode.includes(correctCode)) {
      setIsSuccess(true);
      setTimeout(() => {
        login();
      }, 500);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        bgcolor: "black",
        color: "white",
        p: 2,
      }}
    >
      <Box
        sx={{
          p: 4,
          borderRadius: 6,
          border: "4px solid #4b5563",
          maxWidth: 300,
          width: "100%",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        }}
      >
        <Grid container spacing={1.5} sx={{ maxWidth: 300 }}>
          {digits.map(({ num, letters }) => (
            <Grid key={num} sx={{ flex: "1 0 30%" }}>
              <Button
                onClick={() => handleDigitPress(num)}
                disabled={isSuccess}
                sx={{
                  bgcolor: "#374151",
                  color: "white",
                  border: "2px solid #4b5563",
                  borderRadius: 3,
                  p: 2,
                  width: "100%",
                  height: 80,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "all 0.15s ease",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  "&:hover": {
                    bgcolor: "#4b5563",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    transform: "scale(1.02)",
                  },
                  "&:active": {
                    bgcolor: "#6b7280",
                    transform: "scale(0.95)",
                  },
                  "&:disabled": {
                    opacity: 0.5,
                    cursor: "not-allowed",
                    bgcolor: "#374151",
                  },
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                  {num}
                </Typography>
                {letters && (
                  <Typography
                    variant="caption"
                    sx={{ color: "#9ca3af", mt: 0.5 }}
                  >
                    {letters}
                  </Typography>
                )}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default PayphoneAuth;
