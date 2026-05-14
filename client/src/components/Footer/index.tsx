import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { SponsorBox } from "../Header/SponsorBox";

const SHOW_UNDER_CONSTRUCTION = true;

const UnderConstructionBar = () => (
  <Box
    sx={{
      background: "repeating-linear-gradient(45deg, #f5c800, #f5c800 16px, #1a1a1a 16px, #1a1a1a 32px)",
      py: "6px",
      px: 2,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: 1.5,
      overflow: "hidden",
    }}
  >
    <Typography sx={{ fontSize: "18px", lineHeight: 1 }}>👷</Typography>
    <Typography
      sx={{
        fontFamily: "Antonio, sans-serif",
        fontWeight: 700,
        fontSize: "13px",
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: "#1a1a1a",
        backgroundColor: "#f5c800",
        px: "10px",
        py: "2px",
      }}
    >
      Pardon Our Dust
    </Typography>
    <Typography sx={{ fontSize: "18px", lineHeight: 1 }}>👷</Typography>
  </Box>
);

export const Footer = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  return (
    <Box
      component="footer"
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: isDarkMode ? "#000000ff" : "#f5f5f5",
        borderTop: `1px solid ${isDarkMode ? "#333" : "#ddd"}`,
        zIndex: 1000,
      }}
    >
      {SHOW_UNDER_CONSTRUCTION ? <UnderConstructionBar /> : <SponsorBox />}
    </Box>
  );
};
