import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { SponsorBox } from "../Header/SponsorBox";

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
      <SponsorBox />
    </Box>
  );
};
