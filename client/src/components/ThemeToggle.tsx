import { IconButton } from "@mui/material";
import { Brightness4, Brightness7 } from "@mui/icons-material";

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

export function ThemeToggle({ isDark, onToggle }: ThemeToggleProps) {
  return (
    <IconButton
      onClick={onToggle}
      color="inherit"
      sx={{ position: "fixed", bottom: "0" }}
    >
      {isDark ? <Brightness7 /> : <Brightness4 />}
    </IconButton>
  );
}
