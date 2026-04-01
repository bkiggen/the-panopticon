import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  useTheme,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  Stack,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import { MovieEventService } from "@/services/movieEventService";
import { MovieEventFilters } from "@/types/movieEvent";
import { EventModal } from "@/pages/MovieEvents/Modal";
import type { MovieEventWithDataProps } from "@/types/types";
import { theatreInfo } from "@/lib/theatreInfo";
import useSessionStore from "@/stores/sessionStore";

dayjs.extend(utc);

interface CalendarViewProps {
  filters: MovieEventFilters;
}

interface EventsByDate {
  [date: string]: MovieEventWithDataProps[];
}

export const CalendarView = ({ filters }: CalendarViewProps) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const { isAuthenticated } = useSessionStore();

  const [currentMonth, setCurrentMonth] = useState<Dayjs>(dayjs());
  const [eventsByDate, setEventsByDate] = useState<EventsByDate>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<MovieEventWithDataProps | null>(null);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        // Get events for the current month
        const startOfMonth = currentMonth.startOf("month").format("YYYY-MM-DD");
        const endOfMonth = currentMonth.endOf("month").format("YYYY-MM-DD");

        const result = await MovieEventService.getAll(
          {
            ...filters,
            startDate: startOfMonth,
            endDate: endOfMonth,
          },
          1,
          1000
        );

        // Group events by date
        const grouped: EventsByDate = {};
        result.events.forEach((event: MovieEventWithDataProps) => {
          const dateStr = event.date.split("T")[0]; // YYYY-MM-DD
          if (!grouped[dateStr]) {
            grouped[dateStr] = [];
          }
          grouped[dateStr].push(event);
        });

        setEventsByDate(grouped);
      } catch (error) {
        console.error("Error fetching calendar events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [currentMonth, filters]);

  const handlePrevMonth = () => {
    setCurrentMonth(currentMonth.subtract(1, "month"));
  };

  const handleNextMonth = () => {
    setCurrentMonth(currentMonth.add(1, "month"));
  };

  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr);
  };

  const handleCloseDialog = () => {
    setSelectedDate(null);
  };

  const handleEventClick = (event: MovieEventWithDataProps) => {
    setSelectedEvent(event);
    setEventModalOpen(true);
    setSelectedDate(null); // Close the date dialog
  };

  const handleEventModalClose = () => {
    setEventModalOpen(false);
    setSelectedEvent(null);
  };

  const renderCalendarDays = () => {
    const startOfMonth = currentMonth.startOf("month");
    const endOfMonth = currentMonth.endOf("month");
    const startDate = startOfMonth.startOf("week");
    const endDate = endOfMonth.endOf("week");

    const days = [];
    let currentDate = startDate;

    while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, "day")) {
      const dateStr = currentDate.format("YYYY-MM-DD");
      const events = eventsByDate[dateStr] || [];
      const isCurrentMonth = currentDate.month() === currentMonth.month();
      const isToday = currentDate.isSame(dayjs(), "day");

      days.push(
        <Box
          key={dateStr}
          onClick={() => events.length > 0 && handleDateClick(dateStr)}
          sx={{
            aspectRatio: "1",
            border: `1px solid ${isDarkMode ? "#333" : "#ddd"}`,
            p: 1,
            cursor: events.length > 0 ? "pointer" : "default",
            backgroundColor: isToday
              ? isDarkMode
                ? "#1a1a1a"
                : "#f0f0f0"
              : isDarkMode
              ? "#0a0a0a"
              : "#fff",
            opacity: isCurrentMonth ? 1 : 0.4,
            "&:hover": {
              backgroundColor:
                events.length > 0
                  ? isDarkMode
                    ? "#1a1a1a"
                    : "#f5f5f5"
                  : undefined,
            },
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: isToday ? 700 : 400,
              color: isDarkMode ? "#fff" : "#000",
              mb: 0.5,
            }}
          >
            {currentDate.date()}
          </Typography>
          {events.length > 0 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
              {events.slice(0, 3).map((event, idx) => (
                <Typography
                  key={idx}
                  variant="caption"
                  sx={{
                    fontSize: "0.65rem",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    color: isDarkMode ? "#ccc" : "#666",
                  }}
                >
                  {event.title}
                </Typography>
              ))}
              {events.length > 3 && (
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: "0.65rem",
                    color: isDarkMode ? "#999" : "#999",
                    fontStyle: "italic",
                  }}
                >
                  +{events.length - 3} more
                </Typography>
              )}
            </Box>
          )}
        </Box>
      );

      currentDate = currentDate.add(1, "day");
    }

    return days;
  };

  const selectedDateEvents = selectedDate ? eventsByDate[selectedDate] : [];

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      {/* Calendar header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <IconButton onClick={handlePrevMonth}>
          <ChevronLeftIcon />
        </IconButton>
        <Typography variant="h5" sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {currentMonth.format("MMMM YYYY")}
        </Typography>
        <IconButton onClick={handleNextMonth}>
          <ChevronRightIcon />
        </IconButton>
      </Box>

      {/* Day labels */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 0,
          mb: 0,
        }}
      >
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <Box
            key={day}
            sx={{
              p: 1,
              textAlign: "center",
              borderBottom: `1px solid ${isDarkMode ? "#333" : "#ddd"}`,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: isDarkMode ? "#999" : "#666",
              }}
            >
              {day}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Calendar grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 0,
        }}
      >
        {renderCalendarDays()}
      </Box>

      {loading && (
        <Box sx={{ textAlign: "center", mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Loading events...
          </Typography>
        </Box>
      )}

      {/* Event details dialog */}
      <Dialog
        open={!!selectedDate}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: isDarkMode ? "#1a1a1a" : "#fff",
          },
        }}
      >
        <DialogTitle>
          <Box>
            <Typography variant="h6" component="div">
              {selectedDate && dayjs(selectedDate).format("dddd, MMMM D, YYYY")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedDateEvents.length} {selectedDateEvents.length === 1 ? "screening" : "screenings"}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <List sx={{ p: 0 }}>
            {selectedDateEvents.map((event) => {
              if (isAuthenticated) {
                // Admin view: clickable list items that open EventModal
                const times = event.times.map((t: any) =>
                  typeof t === "string" ? t : t.time
                );
                return (
                  <ListItem
                    key={event.id}
                    onClick={() => handleEventClick(event)}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      borderBottom: `1px solid ${isDarkMode ? "#333" : "#ddd"}`,
                      "&:last-child": { borderBottom: "none" },
                      py: 2,
                      px: 3,
                      cursor: "pointer",
                      "&:hover": {
                        backgroundColor: isDarkMode ? "#2a2a2a" : "#f5f5f5",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 0.5 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {event.title}
                      </Typography>
                      {event.format && event.format !== "Digital" && (
                        <Chip
                          label={event.format}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: "0.7rem",
                            backgroundColor: isDarkMode ? "#333" : "#e0e0e0",
                          }}
                        />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {event.theatre}
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                      {times.join(", ")}
                    </Typography>
                  </ListItem>
                );
              } else {
                // Regular user view: clickable title and showtime chips
                const externalUrl = event.detailUrl || theatreInfo[event.theatre]?.website;
                const showtimes: Array<{ time: string; ticketUrl?: string }> = event.times.map((t: any) => {
                  if (typeof t === "string") {
                    return { time: t, ticketUrl: externalUrl };
                  } else {
                    return { time: t.time, ticketUrl: t.ticketUrl || externalUrl };
                  }
                });

                return (
                  <ListItem
                    key={event.id}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      borderBottom: `1px solid ${isDarkMode ? "#333" : "#ddd"}`,
                      "&:last-child": { borderBottom: "none" },
                      py: 2,
                      px: 3,
                    }}
                  >
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 0.5 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                          cursor: externalUrl ? "pointer" : "default",
                          "&:hover": {
                            textDecoration: externalUrl ? "underline" : "none",
                          },
                        }}
                        onClick={() => externalUrl && window.open(externalUrl, "_blank")}
                      >
                        {event.title}
                      </Typography>
                      {event.format && event.format !== "Digital" && (
                        <Chip
                          label={event.format}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: "0.7rem",
                            backgroundColor: isDarkMode ? "#333" : "#e0e0e0",
                          }}
                        />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {event.theatre}
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {showtimes.map((showing, idx) => (
                        <Chip
                          key={idx}
                          label={showing.time}
                          size="small"
                          clickable={!!showing.ticketUrl}
                          onClick={() =>
                            showing.ticketUrl && window.open(showing.ticketUrl, "_blank")
                          }
                          sx={{
                            cursor: showing.ticketUrl ? "pointer" : "default",
                            fontFamily: "monospace",
                          }}
                        />
                      ))}
                    </Stack>
                  </ListItem>
                );
              }
            })}
          </List>
        </DialogContent>
      </Dialog>

      {/* Event detail modal */}
      <EventModal
        open={eventModalOpen}
        onClose={handleEventModalClose}
        selectedEvent={selectedEvent}
      />
    </Box>
  );
};
