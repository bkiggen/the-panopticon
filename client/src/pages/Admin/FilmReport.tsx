import { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  CircularProgress,
  Alert,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Divider,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadIcon from "@mui/icons-material/Download";
import { MovieEventService } from "@/services/movieEventService";

const PHYSICAL_FORMATS = ["35mm", "70mm", "16mm", "VHS"];

export const FilmReport = () => {
  // Current screenings date range
  const [currentStartDate, setCurrentStartDate] = useState<Dayjs>(dayjs());
  const [currentEndDate, setCurrentEndDate] = useState<Dayjs>(
    dayjs().add(7, "day"),
  );

  // Coming soon date range
  const [comingSoonStartDate, setComingSoonStartDate] = useState<Dayjs>(
    dayjs().add(8, "day"),
  );
  const [comingSoonEndDate, setComingSoonEndDate] = useState<Dayjs>(
    dayjs().add(30, "day"),
  );

  // Format selection - default all physical formats checked
  const [selectedFormats, setSelectedFormats] =
    useState<string[]>(PHYSICAL_FORMATS);

  const [loading, setLoading] = useState(false);
  const [reportText, setReportText] = useState("");
  const [error, setError] = useState("");

  const handleFormatToggle = (format: string) => {
    setSelectedFormats((prev) =>
      prev.includes(format)
        ? prev.filter((f) => f !== format)
        : [...prev, format],
    );
  };

  const formatDateForDisplay = (date: string) => {
    const d = dayjs.utc(date.split("T")[0]);
    return d.format("M/D");
  };

  const groupShowtimesByDate = (times: any[], eventDate: string) => {
    // For now, all times belong to the event date
    // In the future, we could parse times to determine if they roll over to next day
    const grouped: Record<string, string[]> = {};
    const dateKey = formatDateForDisplay(eventDate);

    times.forEach((showtime: any) => {
      const time = typeof showtime === "string" ? showtime : showtime.time;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(time);
    });

    return grouped;
  };

  const processEvents = (events: any[]) => {
    const movieGroups: Record<
      string,
      {
        title: string;
        format: string;
        theatre: string;
        showtimes: Record<string, string[]>; // date -> times
        dates: string[];
      }
    > = {};

    events.forEach((event: any) => {
      const key = `${event.title}-${event.format}-${event.theatre}`;

      if (!movieGroups[key]) {
        movieGroups[key] = {
          title: event.title,
          format: event.format,
          theatre: event.theatre,
          showtimes: {},
          dates: [],
        };
      }

      const dateShowtimes = groupShowtimesByDate(event.times, event.date);
      Object.entries(dateShowtimes).forEach(([date, times]) => {
        if (!movieGroups[key].showtimes[date]) {
          movieGroups[key].showtimes[date] = [];
          movieGroups[key].dates.push(date);
        }
        movieGroups[key].showtimes[date].push(...times);
      });
    });

    // Sort dates for each movie
    Object.values(movieGroups).forEach((movie) => {
      movie.dates.sort((a, b) => {
        const [aMonth, aDay] = a.split("/").map(Number);
        const [bMonth, bDay] = b.split("/").map(Number);
        if (aMonth !== bMonth) return aMonth - bMonth;
        return aDay - bDay;
      });
    });

    return movieGroups;
  };

  const generateReport = async () => {
    setLoading(true);
    setError("");

    try {
      if (selectedFormats.length === 0) {
        setError("Please select at least one format.");
        setLoading(false);
        return;
      }

      // Fetch events for current screenings date range
      const currentResult = await MovieEventService.getAll(
        {
          startDate: currentStartDate.format("YYYY-MM-DD"),
          endDate: currentEndDate.format("YYYY-MM-DD"),
          formats: selectedFormats,
        },
        1,
        1000,
      );

      // Fetch events for coming soon date range
      const comingSoonResult = await MovieEventService.getAll(
        {
          startDate: comingSoonStartDate.format("YYYY-MM-DD"),
          endDate: comingSoonEndDate.format("YYYY-MM-DD"),
          formats: selectedFormats,
        },
        1,
        1000,
      );

      const currentEvents = currentResult.events || [];
      const comingSoonEvents = comingSoonResult.events || [];

      if (currentEvents.length === 0 && comingSoonEvents.length === 0) {
        setError("No film format events found in the selected date ranges.");
        setReportText("");
        return;
      }

      // Process both sets of events
      const currentMovies = processEvents(currentEvents);
      const comingSoonMovies = processEvents(comingSoonEvents);

      // Generate report text
      let text = `Movies on FILM in PDX! 🎞️\n`;
      text += `${currentStartDate.format("MMMM D")} - ${currentEndDate.format("MMMM D, YYYY")}\n\n`;

      // Current showings
      if (Object.keys(currentMovies).length > 0) {
        Object.values(currentMovies).forEach((movie) => {
          text += `○ ${movie.title} on ${movie.format}, playing ${movie.theatre} — `;

          const dateTimeStrings = movie.dates.map((date) => {
            const times = movie.showtimes[date].join(" & ");
            return `${date} @ ${times}`;
          });

          text += dateTimeStrings.join("; ");
          text += `\n\n`;
        });
      }

      // Coming soon section
      if (Object.keys(comingSoonMovies).length > 0) {
        text += `COMING SOON:\n\n`;

        Object.values(comingSoonMovies).forEach((movie) => {
          text += `○ ${movie.title} on ${movie.format}, playing ${movie.theatre} — `;

          const dateTimeStrings = movie.dates.map((date) => {
            const times = movie.showtimes[date].join(" & ");
            return `${date} @ ${times}`;
          });

          text += dateTimeStrings.join("; ");
          text += `\n\n`;
        });
      }

      text += `Did we miss any upcoming 16/35/70mm screenings in Portland? Let us know in the comments! 🎥\n\n`;
      text += `Check out www.panopticonpdx.com for more independent movie listings`;

      setReportText(text);
    } catch (err) {
      console.error("Error generating report:", err);
      setError("Failed to generate report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(reportText);
      alert("Report copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
      alert("Failed to copy to clipboard");
    }
  };

  const downloadAsText = () => {
    const blob = new Blob([reportText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `film-report-${currentStartDate.format("YYYY-MM-DD")}-to-${comingSoonEndDate.format("YYYY-MM-DD")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Paper sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
        <Typography variant="h5" gutterBottom>
          Film Format Report Generator
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Generate a formatted list of physical format screenings for social
          media posts.
        </Typography>

        {/* Format selection */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Film Formats
          </Typography>
          <FormGroup row>
            {PHYSICAL_FORMATS.map((format) => (
              <FormControlLabel
                key={format}
                control={
                  <Checkbox
                    checked={selectedFormats.includes(format)}
                    onChange={() => handleFormatToggle(format)}
                  />
                }
                label={format}
              />
            ))}
          </FormGroup>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Current screenings date range */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Current Screenings
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <DatePicker
              label="Start Date"
              value={currentStartDate}
              onChange={(newValue) => newValue && setCurrentStartDate(newValue)}
              slotProps={{ textField: { fullWidth: true } }}
            />
            <DatePicker
              label="End Date"
              value={currentEndDate}
              onChange={(newValue) => newValue && setCurrentEndDate(newValue)}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Box>
        </Box>

        {/* Coming soon date range */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Coming Soon
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <DatePicker
              label="Start Date"
              value={comingSoonStartDate}
              onChange={(newValue) =>
                newValue && setComingSoonStartDate(newValue)
              }
              slotProps={{ textField: { fullWidth: true } }}
            />
            <DatePicker
              label="End Date"
              value={comingSoonEndDate}
              onChange={(newValue) =>
                newValue && setComingSoonEndDate(newValue)
              }
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Box>
        </Box>

        <Button
          variant="contained"
          onClick={generateReport}
          disabled={loading || selectedFormats.length === 0}
          startIcon={loading ? <CircularProgress size={20} /> : null}
          sx={{ mb: 3 }}
        >
          {loading ? "Generating..." : "Generate Report"}
        </Button>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {reportText && (
          <>
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <Button
                variant="outlined"
                startIcon={<ContentCopyIcon />}
                onClick={copyToClipboard}
              >
                Copy to Clipboard
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={downloadAsText}
              >
                Download as .txt
              </Button>
            </Box>

            <TextField
              multiline
              fullWidth
              rows={20}
              value={reportText}
              InputProps={{
                readOnly: true,
                sx: {
                  fontFamily: "monospace",
                  fontSize: "0.9rem",
                },
              }}
              sx={{ mb: 2 }}
            />
          </>
        )}
      </Paper>
    </LocalizationProvider>
  );
};
