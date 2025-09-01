import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Typography,
  Modal,
  Paper,
  Button,
  useTheme,
  useMediaQuery,
  Stack,
} from "@mui/material";
import { useState } from "react";
import type { MovieEvent } from "@prismaTypes";
import { theatreInfo } from "@/lib/theatreInfo";
import { FormatChip } from "@/components/FormatChip";
import HeadphonesIcon from "@mui/icons-material/Headphones";

interface MovieEventCardsProps {
  data: MovieEvent[] | null;
}

export const Events = ({ data }: MovieEventCardsProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<MovieEvent | null>(null);

  const handleCardClick = (event: MovieEvent) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedEvent(null);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: isMobile ? "short" : "long",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  };

  const hasValidImage = (imageUrl: string) => {
    return imageUrl && !imageUrl.includes("wp-content");
  };

  const handleTheatreClick = (event: React.MouseEvent, theatre: string) => {
    event.stopPropagation();

    const theatreWebsite = theatreInfo[theatre]?.website;
    if (theatreWebsite) {
      window.open(theatreWebsite, "_blank");
    }
  };

  if (!data || data.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No movie events found
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Stack spacing={2}>
        {data.map((event) => (
          <Card
            key={event.id}
            sx={{
              display: "flex",
              cursor: "pointer",
              transition: "all 0.2s ease-in-out",
              boxShadow: "none",
              "&:hover": {
                boxShadow: theme.shadows[4],
                backgroundColor: theme.palette.action.hover,
              },
              flexDirection: isMobile ? "column" : "row",
              minHeight: isMobile ? "auto" : 120,
            }}
            onClick={() => handleCardClick(event)}
          >
            {/* Movie Poster */}
            {hasValidImage(event.imageUrl) && (
              <CardMedia
                component="img"
                sx={{
                  width: isMobile ? "100%" : 100,
                  height: isMobile ? 200 : 120,
                  objectFit: "cover",
                  flexShrink: 0,
                }}
                image={event.imageUrl}
                alt={event.title}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}

            {/* Content */}
            <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
              <CardContent
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: isMobile ? "column" : "row",
                  gap: 2,
                  pb: isMobile ? 2 : "16px !important",
                }}
              >
                {/* Left side - Title and Date */}
                <Box
                  sx={{
                    flex: isMobile ? "none" : 2,
                    minWidth: 0, // Allows text to wrap properly
                  }}
                >
                  <Typography
                    variant={isMobile ? "h6" : "h5"}
                    component="h2"
                    sx={{
                      fontWeight: "bold",
                      mb: 1,
                      lineHeight: 1.2,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {event.title}
                  </Typography>

                  <Typography
                    variant="subtitle1"
                    color="text.secondary"
                    sx={{ mb: isMobile ? 2 : 0 }}
                  >
                    {formatDate(event.date)}
                  </Typography>
                </Box>

                {/* Center - Showtimes */}
                <Box
                  sx={{
                    flex: isMobile ? "none" : 2,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 0.5,
                      maxHeight: isMobile ? "none" : "60px",
                      overflow: "hidden",
                    }}
                  >
                    {event.times
                      .slice(0, isMobile ? 4 : 6)
                      .map((time, index) => (
                        <Chip
                          key={index}
                          label={time}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: "0.75rem" }}
                        />
                      ))}
                    {event.times.length > (isMobile ? 4 : 6) && (
                      <Chip
                        label={`+${event.times.length - (isMobile ? 4 : 6)}`}
                        size="small"
                        variant="outlined"
                        color="secondary"
                        sx={{ fontSize: "0.75rem" }}
                      />
                    )}
                  </Box>
                </Box>

                {/* Right side - Theater and Format */}
                <Box
                  sx={{
                    flex: isMobile ? "none" : 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: isMobile ? "flex-start" : "flex-end",
                    gap: 1,
                  }}
                >
                  <Chip
                    label={event.theatre}
                    color="primary"
                    variant="filled"
                    onClick={(e) => handleTheatreClick(e, event.theatre)}
                    sx={{
                      fontWeight: "medium",
                      maxWidth: "100%",
                    }}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 1,
                      justifyContent: isMobile ? "flex-start" : "flex-end",
                    }}
                  >
                    <FormatChip format={event.format} />
                    {event.accessibility?.map((feature, index) => (
                      <Chip
                        key={index}
                        label={feature}
                        size="small"
                        color="success"
                        variant="outlined"
                        sx={{ fontSize: "0.7rem" }}
                        avatar={
                          <HeadphonesIcon sx={{ "*": { color: "#4caf50" } }} />
                        }
                      />
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Box>
          </Card>
        ))}
      </Stack>

      {/* Modal for movie details */}
      <Modal
        open={modalOpen}
        onClose={handleModalClose}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper
          sx={{
            width: "90%",
            maxWidth: 600,
            maxHeight: "90%",
            overflow: "auto",
            p: 4,
            outline: "none",
          }}
        >
          {selectedEvent && hasValidImage(selectedEvent.imageUrl) && (
            <Box sx={{ mb: 3, textAlign: "center" }}>
              <img
                src={selectedEvent.imageUrl}
                alt={selectedEvent.title}
                style={{
                  maxWidth: "100%",
                  height: "auto",
                  maxHeight: 400,
                  objectFit: "contain",
                }}
              />
            </Box>
          )}

          <Typography variant="h4" gutterBottom>
            {selectedEvent?.title}
          </Typography>

          <Typography variant="h6" color="text.secondary" gutterBottom>
            {selectedEvent && formatDate(selectedEvent.date)}
          </Typography>

          {/* All showtimes */}
          <Box sx={{ my: 3 }}>
            <Typography variant="h6" gutterBottom>
              Showtimes
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {selectedEvent?.times.map((time, index) => (
                <Chip key={index} label={time} variant="outlined" />
              ))}
            </Box>
          </Box>

          {/* Theater and format info */}
          <Box sx={{ my: 3 }}>
            <Typography variant="h6" gutterBottom>
              Details
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <Chip
                label={selectedEvent?.theatre}
                color="primary"
                variant="filled"
              />
              <Chip
                label={selectedEvent?.format}
                color="info"
                variant="outlined"
              />
            </Stack>

            {selectedEvent?.accessibility &&
              selectedEvent.accessibility.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Accessibility Features
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    {selectedEvent.accessibility.map((feature, index) => (
                      <Chip
                        key={index}
                        label={feature}
                        color="success"
                        variant="outlined"
                        size="small"
                        avatar={
                          <HeadphonesIcon sx={{ "*": { color: "#4caf50" } }} />
                        }
                      />
                    ))}
                  </Stack>
                </Box>
              )}
          </Box>

          <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={handleModalClose} variant="contained">
              Close
            </Button>
          </Box>
        </Paper>
      </Modal>
    </Box>
  );
};
