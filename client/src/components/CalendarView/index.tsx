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
import { getBestData } from "@/utils/general";

dayjs.extend(utc);

type ViewMode = "month" | "week";

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

  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs());
  const [eventsByDate, setEventsByDate] = useState<EventsByDate>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<MovieEventWithDataProps | null>(null);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Compute fetch range based on view mode
  const getFetchRange = () => {
    if (viewMode === "week") {
      const start = currentDate.startOf("week");
      const end = currentDate.endOf("week");
      return { start, end };
    }
    return {
      start: currentDate.startOf("month"),
      end: currentDate.endOf("month"),
    };
  };

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const { start, end } = getFetchRange();
        const result = await MovieEventService.getAll(
          {
            ...filters,
            startDate: start.format("YYYY-MM-DD"),
            endDate: end.format("YYYY-MM-DD"),
          },
          1,
          1000
        );

        const grouped: EventsByDate = {};
        result.events.forEach((event: MovieEventWithDataProps) => {
          const dateStr = event.date.split("T")[0];
          if (!grouped[dateStr]) grouped[dateStr] = [];
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
  }, [currentDate, viewMode, filters]);

  const handlePrev = () => {
    setCurrentDate(
      viewMode === "week"
        ? currentDate.subtract(1, "week")
        : currentDate.subtract(1, "month")
    );
  };

  const handleNext = () => {
    setCurrentDate(
      viewMode === "week"
        ? currentDate.add(1, "week")
        : currentDate.add(1, "month")
    );
  };

  const handleDateClick = (dateStr: string) => setSelectedDate(dateStr);
  const handleCloseDialog = () => setSelectedDate(null);

  const handleEventClick = (event: MovieEventWithDataProps) => {
    setSelectedEvent(event);
    setEventModalOpen(true);
    setSelectedDate(null);
  };

  const handleEventModalClose = () => {
    setEventModalOpen(false);
    setSelectedEvent(null);
  };

  const headerLabel = () => {
    if (viewMode === "month") return currentDate.format("MMMM YYYY");
    const start = currentDate.startOf("week");
    const end = currentDate.endOf("week");
    if (start.month() === end.month()) {
      return `${start.format("MMM D")} – ${end.format("D, YYYY")}`;
    }
    return `${start.format("MMM D")} – ${end.format("MMM D, YYYY")}`;
  };

  // ── Month view ────────────────────────────────────────────────────────────────

  const renderMonthView = () => {
    const startDate = currentDate.startOf("month").startOf("week");
    const endDate = currentDate.endOf("month").endOf("week");

    const days = [];
    let day = startDate;

    while (day.isBefore(endDate) || day.isSame(endDate, "day")) {
      const dateStr = day.format("YYYY-MM-DD");
      const events = eventsByDate[dateStr] || [];
      const isCurrentMonth = day.month() === currentDate.month();
      const isToday = day.isSame(dayjs(), "day");

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
              ? isDarkMode ? "#1a1a1a" : "#f0f0f0"
              : isDarkMode ? "#0a0a0a" : "#fff",
            opacity: isCurrentMonth ? 1 : 0.4,
            "&:hover": {
              backgroundColor: events.length > 0
                ? isDarkMode ? "#1a1a1a" : "#f5f5f5"
                : undefined,
            },
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography
            variant="caption"
            sx={{ fontWeight: isToday ? 700 : 400, color: isDarkMode ? "#fff" : "#000", mb: 0.5 }}
          >
            {day.date()}
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
                  sx={{ fontSize: "0.65rem", color: "#999", fontStyle: "italic" }}
                >
                  +{events.length - 3} more
                </Typography>
              )}
            </Box>
          )}
        </Box>
      );

      day = day.add(1, "day");
    }

    return (
      <>
        {/* Day labels */}
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <Box key={d} sx={{ p: 1, textAlign: "center", borderBottom: `1px solid ${isDarkMode ? "#333" : "#ddd"}` }}>
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: isDarkMode ? "#999" : "#666" }}
              >
                {d}
              </Typography>
            </Box>
          ))}
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
          {days}
        </Box>
      </>
    );
  };

  // ── Week view ─────────────────────────────────────────────────────────────────

  const renderWeekView = () => {
    const startOfWeek = currentDate.startOf("week");
    const days = Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, "day"));

    return (
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", border: `1px solid ${isDarkMode ? "#333" : "#ddd"}`, borderRight: "none", borderBottom: "none" }}>
        {days.map((day) => {
          const dateStr = day.format("YYYY-MM-DD");
          const events = eventsByDate[dateStr] || [];
          const isToday = day.isSame(dayjs(), "day");

          return (
            <Box
              key={dateStr}
              sx={{
                borderRight: `1px solid ${isDarkMode ? "#333" : "#ddd"}`,
                borderBottom: `1px solid ${isDarkMode ? "#333" : "#ddd"}`,
                minHeight: 480,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Day header */}
              <Box
                sx={{
                  p: 1,
                  borderBottom: `1px solid ${isDarkMode ? "#333" : "#ddd"}`,
                  backgroundColor: isToday
                    ? isDarkMode ? "#1a1a1a" : "#f0f0f0"
                    : isDarkMode ? "#0d0d0d" : "#fafafa",
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ display: "block", textTransform: "uppercase", letterSpacing: "0.06em", color: isDarkMode ? "#999" : "#666", fontSize: "0.6rem" }}
                >
                  {day.format("ddd")}
                </Typography>
                <Typography
                  sx={{
                    fontWeight: isToday ? 700 : 400,
                    fontSize: "1.1rem",
                    color: isToday ? (isDarkMode ? "#fff" : "#000") : isDarkMode ? "#aaa" : "#555",
                    lineHeight: 1.2,
                  }}
                >
                  {day.date()}
                </Typography>
              </Box>

              {/* Events */}
              <Box sx={{ flex: 1, p: 0.5, display: "flex", flexDirection: "column", gap: 0.5 }}>
                {events.map((event, idx) => (
                  <Box
                    key={idx}
                    onClick={() => handleDateClick(dateStr)}
                    sx={{
                      p: "4px 6px",
                      borderRadius: "3px",
                      backgroundColor: isDarkMode ? "#1a1a1a" : "#f0f0f0",
                      cursor: "pointer",
                      "&:hover": { backgroundColor: isDarkMode ? "#252525" : "#e8e8e8" },
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        fontSize: "0.68rem",
                        lineHeight: 1.35,
                        color: isDarkMode ? "#ddd" : "#333",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {event.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ fontSize: "0.6rem", color: isDarkMode ? "#666" : "#999" }}
                    >
                      {event.theatre}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          );
        })}
      </Box>
    );
  };

  const selectedDateEvents = selectedDate ? eventsByDate[selectedDate] || [] : [];

  const border = `1px solid ${isDarkMode ? "#333" : "#ddd"}`;

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <IconButton onClick={handlePrev}>
          <ChevronLeftIcon />
        </IconButton>

        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          <Typography variant="h5" sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {headerLabel()}
          </Typography>

          {/* View toggle */}
          <Box sx={{ display: "flex", border, overflow: "hidden", borderRadius: "2px" }}>
            {(["month", "week"] as ViewMode[]).map((mode) => (
              <Box
                key={mode}
                onClick={() => setViewMode(mode)}
                sx={{
                  px: "12px",
                  py: "6px",
                  cursor: "pointer",
                  fontSize: "11px",
                  fontFamily: "Antonio, sans-serif",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  backgroundColor: viewMode === mode
                    ? isDarkMode ? "#222" : "#eee"
                    : "transparent",
                  color: viewMode === mode
                    ? isDarkMode ? "#fff" : "#000"
                    : isDarkMode ? "#555" : "#aaa",
                  transition: "background 0.15s, color 0.15s",
                  "&:hover": { backgroundColor: isDarkMode ? "#1a1a1a" : "#f0f0f0" },
                  borderRight: mode === "month" ? border : "none",
                }}
              >
                {mode}
              </Box>
            ))}
          </Box>
        </Box>

        <IconButton onClick={handleNext}>
          <ChevronRightIcon />
        </IconButton>
      </Box>

      {/* Calendar body */}
      {viewMode === "month" ? renderMonthView() : renderWeekView()}

      {loading && (
        <Box sx={{ textAlign: "center", mt: 3 }}>
          <Typography variant="body2" color="text.secondary">Loading events...</Typography>
        </Box>
      )}

      {/* Date detail dialog */}
      <Dialog
        open={!!selectedDate}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { backgroundColor: isDarkMode ? "#1a1a1a" : "#fff" } }}
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
              const displayImageUrl = getBestData(event.imageUrl, event.movieData?.imageUrl);

              if (isAuthenticated) {
                const times = event.times.map((t: any) => (typeof t === "string" ? t : t.time));
                return (
                  <ListItem
                    key={event.id}
                    onClick={() => handleEventClick(event)}
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "flex-start",
                      borderBottom: border,
                      "&:last-child": { borderBottom: "none" },
                      py: 2,
                      px: 3,
                      cursor: "pointer",
                      "&:hover": { backgroundColor: isDarkMode ? "#2a2a2a" : "#f5f5f5" },
                      gap: 2,
                    }}
                  >
                    <Box sx={{ width: 60, height: 90, flexShrink: 0, backgroundColor: isDarkMode ? "#333" : "#e0e0e0", borderRadius: 1, overflow: "hidden" }}>
                      {displayImageUrl && (
                        <img src={displayImageUrl} alt={event.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      )}
                    </Box>
                    <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                      <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 0.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{event.title}</Typography>
                        {event.format && event.format !== "Digital" && (
                          <Chip label={event.format} size="small" sx={{ height: 20, fontSize: "0.7rem", backgroundColor: isDarkMode ? "#333" : "#e0e0e0" }} />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>{event.theatre}</Typography>
                      <Typography variant="body2" sx={{ fontFamily: "monospace" }}>{times.join(", ")}</Typography>
                    </Box>
                  </ListItem>
                );
              } else {
                const externalUrl = event.detailUrl || theatreInfo[event.theatre]?.website;
                const showtimes: Array<{ time: string; ticketUrl?: string }> = event.times.map((t: any) =>
                  typeof t === "string" ? { time: t, ticketUrl: externalUrl } : { time: t.time, ticketUrl: t.ticketUrl || externalUrl }
                );
                return (
                  <ListItem
                    key={event.id}
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "flex-start",
                      borderBottom: border,
                      "&:last-child": { borderBottom: "none" },
                      py: 2,
                      px: 3,
                      gap: 2,
                    }}
                  >
                    <Box sx={{ width: 60, height: 90, flexShrink: 0, backgroundColor: isDarkMode ? "#333" : "#e0e0e0", borderRadius: 1, overflow: "hidden" }}>
                      {displayImageUrl && (
                        <img src={displayImageUrl} alt={event.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      )}
                    </Box>
                    <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                      <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 0.5 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600, cursor: externalUrl ? "pointer" : "default", "&:hover": { textDecoration: externalUrl ? "underline" : "none" } }}
                          onClick={() => externalUrl && window.open(externalUrl, "_blank")}
                        >
                          {event.title}
                        </Typography>
                        {event.format && event.format !== "Digital" && (
                          <Chip label={event.format} size="small" sx={{ height: 20, fontSize: "0.7rem", backgroundColor: isDarkMode ? "#333" : "#e0e0e0" }} />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{event.theatre}</Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {showtimes.map((showing, idx) => (
                          <Chip
                            key={idx}
                            label={showing.time}
                            size="small"
                            clickable={!!showing.ticketUrl}
                            onClick={() => showing.ticketUrl && window.open(showing.ticketUrl, "_blank")}
                            sx={{ cursor: showing.ticketUrl ? "pointer" : "default", fontFamily: "monospace" }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  </ListItem>
                );
              }
            })}
          </List>
        </DialogContent>
      </Dialog>

      <EventModal open={eventModalOpen} onClose={handleEventModalClose} selectedEvent={selectedEvent} />
    </Box>
  );
};
