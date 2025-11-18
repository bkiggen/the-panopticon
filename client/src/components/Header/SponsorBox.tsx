import { Box, Link, Button, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

export const SponsorBox = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        backgroundColor: isDarkMode ? "#000000ff" : "#f5f5f5",
        py: 1,
        px: 2,
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        position: "sticky",
        top: 0,
      }}
    >
      <Typography variant="body2" color="textSecondary" sx={{ mr: 1 }}>
        Sponsors:
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Button sx={{ height: "20px", textTransform: "none", px: "6px" }}>
          <Link
            href="https://patreon.com/PanopticonPDX"
            target="_blank"
            rel="noopener"
            color="primary"
            underline="none"
          >
            Our Patreon
          </Link>
        </Button>
        <Button sx={{ height: "20px", textTransform: "none", px: "6px" }}>
          <Link
            href="https://www.instagram.com/pictureshowcollections/"
            target="_blank"
            rel="noopener"
            color="primary"
            underline="none"
          >
            Pictureshow Collections
          </Link>
        </Button>
      </Box>
    </Box>
  );
};
