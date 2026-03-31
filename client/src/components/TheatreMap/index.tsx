import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Tooltip, Popup } from "react-leaflet";
import { Box, Typography, Link, CircularProgress, Button } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { theatreLocations, PORTLAND_CENTER } from "@/lib/theatreCoordinates";
import { MovieEventService } from "@/services/movieEventService";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icons in React-Leaflet
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface TheatreMapProps {
  onTheatreSelect: (theatreName: string) => void;
}

export const TheatreMap = ({ onTheatreSelect }: TheatreMapProps) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const [theatreCounts, setTheatreCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const counts = await MovieEventService.getTheatreCountsToday();
        setTheatreCounts(counts);
      } catch (error) {
        console.error("Failed to fetch theatre counts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          height: "calc(100vh - 200px)",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "calc(100vh - 200px)", // Account for header and footer
        width: "100%",
        position: "relative",
      }}
    >
      <MapContainer
        center={PORTLAND_CENTER}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={
            isDarkMode
              ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          }
        />
        {theatreLocations.map((theatre) => {
          const count = theatreCounts[theatre.name] || 0;
          return (
            <Marker
              key={theatre.name}
              position={theatre.coordinates}
            >
              <Tooltip
                permanent
                direction="top"
                offset={[0, -40]}
                opacity={0.9}
              >
                <Box
                  sx={{
                    textAlign: "center",
                    cursor: "pointer",
                    "&:hover": {
                      fontWeight: "bold",
                    },
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      fontSize: "0.75rem",
                      lineHeight: 1.2,
                      marginBottom: count > 0 ? "2px" : 0,
                    }}
                  >
                    {theatre.name}
                  </Typography>
                  {count > 0 && (
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: "0.65rem",
                        color: isDarkMode ? "#aaa" : "#666",
                        fontStyle: "italic",
                      }}
                    >
                      {count} {count === 1 ? "movie" : "movies"} today
                    </Typography>
                  )}
                </Box>
              </Tooltip>
              <Popup>
                <Box sx={{ minWidth: 220 }}>
                  <Link
                    href={theatre.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="hover"
                    sx={{
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      color: "inherit",
                      display: "block",
                      marginBottom: 1,
                    }}
                  >
                    {theatre.name}
                  </Link>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {theatre.neighborhood}
                  </Typography>
                  <Typography variant="body2" gutterBottom sx={{ fontSize: "0.875rem" }}>
                    {theatre.address}
                  </Typography>
                  <Link
                    href={`tel:${theatre.phone}`}
                    underline="hover"
                    sx={{
                      fontSize: "0.875rem",
                      color: "inherit",
                      display: "block",
                      marginBottom: 2,
                    }}
                  >
                    {theatre.phone}
                  </Link>
                  {count > 0 ? (
                    <Button
                      variant="contained"
                      size="small"
                      fullWidth
                      onClick={() => onTheatreSelect(theatre.name)}
                      sx={{
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        fontSize: "0.75rem",
                        py: 0.75,
                      }}
                    >
                      See {count} {count === 1 ? "Movie" : "Movies"} Today
                    </Button>
                  ) : (
                    <Typography variant="body2" color="textSecondary" sx={{ fontStyle: "italic", textAlign: "center" }}>
                      No movies today
                    </Typography>
                  )}
                </Box>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </Box>
  );
};
