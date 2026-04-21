import { Tabs, Tab, Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useSessionStore from "@/stores/sessionStore";

interface NavigationProps {
  activeTab: "listings" | "calendar";
  onTabChange: (tab: "listings" | "calendar") => void;
}

export const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const { isAuthenticated } = useSessionStore();

  const handleChange = (
    _event: React.SyntheticEvent,
    newValue: "listings" | "calendar",
  ) => {
    onTabChange(newValue);
  };

  return (
    <Box
      sx={{
        backgroundColor: isDarkMode ? "black" : "#f5f5f5",
        borderBottom: `1px solid ${isDarkMode ? "#333" : "#ddd"}`,
        position: "sticky",
        top: isAuthenticated ? 56 : 38,
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
        <Tab label="List" value="listings" />
        <Tab label="Calendar" value="calendar" />
      </Tabs>
    </Box>
  );
};
