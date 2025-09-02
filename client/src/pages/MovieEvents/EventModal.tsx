import {
  Box,
  Chip,
  Typography,
  Modal,
  Paper,
  Button,
  Stack,
  useMediaQuery,
  useTheme,
  CircularProgress,
} from "@mui/material";
import { useState, useEffect } from "react";
import HeadphonesIcon from "@mui/icons-material/Headphones";
import { formatDate, hasValidImage } from "@/utils/general";
import type { MovieEvent } from "@prismaTypes";
import { MovieEventService } from "@/services/movieEventService";
import CloseIcon from "@mui/icons-material/Close";

type EventModalProps = {
  open: boolean;
  onClose: () => void;
  selectedEvent: MovieEvent | null;
};

export const EventModal = ({
  open,
  onClose,
  selectedEvent,
}: EventModalProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [allTitleEvents, setAllTitleEvents] = useState<MovieEvent[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch all events with the same title when modal opens
  useEffect(() => {
    const fetchEventsByTitle = async () => {
      if (!selectedEvent?.title || !open) return;

      setLoading(true);
      try {
        const result = await MovieEventService.getAll(
          { search: selectedEvent.title },
          1,
          100
        );
        setAllTitleEvents(result.events || []);
      } catch (error) {
        console.error("Failed to fetch events by title:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventsByTitle();
  }, [selectedEvent?.title, open]);

  // Group events by date and theatre for better display
  const groupedEvents = allTitleEvents.reduce((groups, event) => {
    const key = `${event.date}-${event.theatre}`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(event);
    return groups;
  }, {} as Record<string, MovieEvent[]>);

  return (
    <Modal
      open={open}
      onClose={onClose}
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
          position: "relative",
        }}
      >
        <CloseIcon
          onClick={onClose}
          sx={{ position: "absolute", top: 16, right: 16, cursor: "pointer" }}
        />
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

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* All showings for this title */}
            <Box sx={{ my: 3 }}>
              <Typography variant="h6" gutterBottom>
                All Showings ({allTitleEvents.length} found)
              </Typography>

              {Object.entries(groupedEvents).map(([key, events]) => {
                const event = events[0]; // Use first event for date/theatre info
                const allTimes = events.flatMap((e) => e.times);

                return (
                  <Box
                    key={key}
                    sx={{
                      mb: 2,
                      p: 2,
                      bgcolor: "background.paper",
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight="bold">
                      {formatDate(event.date, isMobile)} • {event.theatre}
                    </Typography>

                    <Stack direction="row" spacing={1} sx={{ mt: 1, mb: 1 }}>
                      <Chip
                        label={event.format}
                        color="info"
                        variant="outlined"
                        size="small"
                      />
                    </Stack>

                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {allTimes.map((time, index) => (
                        <Chip
                          key={index}
                          label={time}
                          variant="outlined"
                          size="small"
                        />
                      ))}
                    </Box>

                    {event.accessibility && event.accessibility.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Stack direction="row" spacing={0.5}>
                          {event.accessibility.map((feature, index) => (
                            <Chip
                              key={index}
                              label={feature}
                              color="success"
                              variant="outlined"
                              size="small"
                              avatar={
                                <HeadphonesIcon
                                  sx={{ "*": { color: "#4caf50" } }}
                                />
                              }
                            />
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Box>
                );
              })}

              {allTitleEvents.length === 0 && !loading && (
                <Typography color="text.secondary">
                  No other showings found for this title.
                </Typography>
              )}
            </Box>
          </>
        )}
      </Paper>
    </Modal>
  );
};
