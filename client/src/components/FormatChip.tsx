import { Chip } from "@mui/material";
import GroupWorkIcon from "@mui/icons-material/GroupWork";
import AlbumIcon from "@mui/icons-material/Album";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";

type FormatChipProps = {
  format: string;
};

const formatPropMap: Record<
  string,
  { label: string; sx: any; icon: React.ReactElement }
> = {
  Digital: {
    label: "Digital",
    sx: { borderColor: "skyblue", color: "skyblue" },
    icon: <AlbumIcon sx={{ "*": { color: "#87CEEB" } }} />,
  },
  "16mm": {
    label: "16mm",
    sx: { borderColor: "#35bea8ff", color: "#35bea8ff" },
    icon: <GroupWorkIcon sx={{ "*": { color: "#35bea8ff" } }} />,
  },
  "35mm": {
    label: "35mm",
    sx: { borderColor: "#35bea8ff", color: "#35bea8ff" },
    icon: <GroupWorkIcon sx={{ "*": { color: "#35bea8ff" } }} />,
  },
  "70mm": {
    label: "70mm",
    sx: { borderColor: "#ae61cdff", color: "#ae61cdff" },
    icon: <GroupWorkIcon sx={{ "*": { color: "#ae61cdff" } }} />,
  },
  VHS: {
    label: "VHS",
    sx: { borderColor: "#d4d28eff", color: "#d4d28eff" },
    icon: <PlayCircleOutlineIcon sx={{ "*": { color: "#d4d28eff" } }} />,
  },
};

export const FormatChip = ({ format }: FormatChipProps) => {
  const { label, sx, icon } = formatPropMap[format] || {
    label: format,
    sx: { borderColor: "info.main", color: "info.main" },
  };

  return (
    <Chip
      label={label}
      size="small"
      sx={{ ...sx, display: "flex", alignItems: "center" }}
      variant="outlined"
      avatar={icon}
    />
  );
};
