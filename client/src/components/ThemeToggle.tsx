import { IconButton } from "@mui/material";
import { Brightness4, Brightness7 } from "@mui/icons-material";

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

export function ThemeToggle({ isDark, onToggle }: ThemeToggleProps) {
  return (
    <IconButton onClick={onToggle} color="inherit">
      {isDark ? <Brightness7 /> : <Brightness4 />}
    </IconButton>
  );
}
