import { Tabs, Tab, Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";

interface NavigationProps {
  activeTab: "listings" | "map";
  onTabChange: (tab: "listings" | "map") => void;
}

export const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const handleChange = (_event: React.SyntheticEvent, newValue: "listings" | "map") => {
    onTabChange(newValue);
  };

  return (
    <Box
      sx={{
        backgroundColor: isDarkMode ? "#0a0a0a" : "#f5f5f5",
        borderBottom: `1px solid ${isDarkMode ? "#333" : "#ddd"}`,
        position: "sticky",
        top: 38,
        zIndex: 1001,
      }}
    >
      <Tabs
        value={activeTab}
        onChange={handleChange}
        sx={{
          minHeight: 40,
          "& .MuiTabs-indicator": {
            height: 2,
            backgroundColor: isDarkMode ? "#fff" : "#000",
          },
          "& .MuiTab-root": {
            minHeight: 40,
            fontSize: "0.875rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            fontWeight: 500,
            color: isDarkMode ? "#999" : "#666",
            backgroundColor: "transparent",
            "&.Mui-selected": {
              color: isDarkMode ? "#fff" : "#000",
              backgroundColor: "transparent",
            },
            "&:hover": {
              color: isDarkMode ? "#ccc" : "#333",
              backgroundColor: "transparent",
            },
          },
        }}
      >
        <Tab label="Listings" value="listings" />
        <Tab label="Map" value="map" />
      </Tabs>
    </Box>
  );
};
