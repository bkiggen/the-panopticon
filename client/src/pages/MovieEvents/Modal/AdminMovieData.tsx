import {
  Box,
  Typography,
  Paper,
  Chip,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  FormHelperText,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { genres } from "@/lib/genres";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import type { MovieEventWithDataProps } from "@/types/types";
import { getBestData } from "@/utils/general";
import { theatreInfo } from "@/lib/theatreInfo";
import { formats } from "@/lib/formats";
import useMovieEventStore from "@/stores/movieEventStore";
import { accessibilityOptions } from "@/lib/accessibilityOptions";

type AdminMovieDataProps = {
  selectedEvent: MovieEventWithDataProps | null;
  onClose: () => void;
};

interface AdminEventFormData {
  title: string;
  originalTitle: string;
  description: string;
  theatre: string;
  format: string;
  date: Date;
  times: { value: string }[];
  imageUrl: string;
  trailerUrl: string;
  imdbId: string;
  rottenTomatoesId: string;
  genres: { value: string }[];
  accessibility: { value: string }[];
  discount: { value: string }[];
}

const schema = yup.object().shape({
  title: yup.string().required("Title is required"),
  originalTitle: yup.string().required("Original title is required"),
  description: yup.string().optional().default(""),
  theatre: yup.string().required("Theatre is required"),
  format: yup.string().required("Format is required"),
  date: yup.date().required("Date is required"),
  times: yup
    .array()
    .of(yup.object({ value: yup.string().required() }))
    .min(1, "At least one showtime is required")
    .default([]),
  imageUrl: yup.string().required("Image URL is required"),
  trailerUrl: yup.string().url("Must be a valid URL").optional().default(""),
  imdbId: yup.string().optional().default(""),
  rottenTomatoesId: yup.string().optional().default(""),
  genres: yup
    .array()
    .of(yup.object({ value: yup.string().required() }))
    .default([]),
  accessibility: yup
    .array()
    .of(yup.object({ value: yup.string().required() }))
    .default([]),
  discount: yup
    .array()
    .of(yup.object({ value: yup.string().required() }))
    .default([]),
});

const DISCOUNT_OPTIONS = ["Matinee"];

export const AdminMovieData = ({
  selectedEvent,
  onClose,
}: AdminMovieDataProps) => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState<number>(7);
  const [selectedMinute, setSelectedMinute] = useState<number>(30);
  const [selectedPeriod, setSelectedPeriod] = useState<"AM" | "PM">("PM");
  const [genreInput, setGenreInput] = useState("");
  const [accessibilityInput, setAccessibilityInput] = useState("");
  const [discountInput, setDiscountInput] = useState("");

  const { submitting, deleteEvent, updateEvent, error } = useMovieEventStore();

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<AdminEventFormData>({
    resolver: yupResolver(schema),
    defaultValues: selectedEvent
      ? {
          title: selectedEvent.title,
          originalTitle: selectedEvent.originalTitle,
          description: selectedEvent.description || "",
          theatre: selectedEvent.theatre,
          format: selectedEvent.format,
          date: new Date(selectedEvent.date),
          times: (selectedEvent.times || []).map((time) => ({ value: time })),
          imageUrl: selectedEvent.imageUrl,
          trailerUrl: selectedEvent.trailerUrl || "",
          imdbId: selectedEvent.imdbId || "",
          rottenTomatoesId: selectedEvent.rottenTomatoesId || "",
          genres: (selectedEvent.genres || []).map((genre) => ({
            value: genre,
          })),
          accessibility: (selectedEvent.accessibility || []).map((item) => ({
            value: item,
          })),
          discount: (selectedEvent.discount || []).map((item) => ({
            value: item,
          })),
        }
      : undefined,
  });

  const {
    fields: timeFields,
    append: appendTime,
    remove: removeTime,
  } = useFieldArray({
    control,
    name: "times",
  });

  const {
    fields: genreFields,
    append: appendGenre,
    remove: removeGenre,
  } = useFieldArray({
    control,
    name: "genres",
  });

  const {
    fields: accessibilityFields,
    append: appendAccessibility,
    remove: removeAccessibility,
  } = useFieldArray({
    control,
    name: "accessibility",
  });

  const {
    fields: discountFields,
    append: appendDiscount,
    remove: removeDiscount,
  } = useFieldArray({
    control,
    name: "discount",
  });

  if (!selectedEvent) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>No movie selected</Typography>
      </Box>
    );
  }

  const { movieData } = selectedEvent;
  const displayTitle =
    getBestData(selectedEvent.originalTitle, movieData?.originalTitle) ||
    selectedEvent.title;

  const handleSave = async (data: AdminEventFormData) => {
    try {
      const updateData = {
        title: data.title,
        originalTitle: data.originalTitle,
        description: data.description || null,
        theatre: data.theatre,
        format: data.format,
        date: data.date,
        times: data.times.map((t) => t.value),
        imageUrl: data.imageUrl,
        trailerUrl: data.trailerUrl || null,
        imdbId: data.imdbId || null,
        rottenTomatoesId: data.rottenTomatoesId || null,
        genres: data.genres.map((g) => g.value),
        accessibility: data.accessibility.map((a) => a.value),
        discount: data.discount.map((d) => d.value),
      };

      await updateEvent(selectedEvent.id, updateData);
    } catch (error) {
      console.error("Failed to update event:", error);
    }
  };

  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteConfirmOpen(false);
    await deleteEvent(selectedEvent.id);
    onClose();
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
  };

  const handleAddGenre = () => {
    if (genreInput.trim()) {
      appendGenre({ value: genreInput.trim() });
      setGenreInput("");
    }
  };

  const handleAddAccessibility = () => {
    if (accessibilityInput.trim()) {
      appendAccessibility({ value: accessibilityInput.trim() });
      setAccessibilityInput("");
    }
  };

  const handleAddDiscount = () => {
    if (discountInput.trim()) {
      appendDiscount({ value: discountInput.trim() });
      setDiscountInput("");
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Admin Controls */}
        <Box
          sx={{ mb: 3, display: "flex", gap: 2, justifyContent: "flex-end" }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit(handleSave)}
            disabled={submitting || !isDirty}
            startIcon={submitting ? <CircularProgress size={20} /> : null}
          >
            {submitting ? "Saving..." : "Save Changes"}
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteClick}
            disabled={submitting}
          >
            Delete Event
          </Button>
        </Box>

        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit(handleSave)}>
            <Grid container spacing={3}>
              <Grid size={12}>
                <Typography variant="h6" gutterBottom>
                  Edit Event: {displayTitle}
                </Typography>
              </Grid>

              {/* Basic Information */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Title"
                      error={!!errors.title}
                      helperText={errors.title?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="originalTitle"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Original Title"
                      error={!!errors.originalTitle}
                      helperText={errors.originalTitle?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={12}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Description"
                      multiline
                      rows={4}
                      error={!!errors.description}
                      helperText={errors.description?.message}
                    />
                  )}
                />
              </Grid>

              {/* Event Details */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="theatre"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.theatre}>
                      <InputLabel>Theatre</InputLabel>
                      <Select {...field} label="Theatre">
                        {Object.keys(theatreInfo).map((theatreName) => (
                          <MenuItem key={theatreName} value={theatreName}>
                            {theatreName}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.theatre && (
                        <FormHelperText>
                          {errors.theatre.message}
                        </FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="format"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.format}>
                      <InputLabel>Format</InputLabel>
                      <Select {...field} label="Format">
                        {formats.map((format) => (
                          <MenuItem key={format} value={format}>
                            {format}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.format && (
                        <FormHelperText>{errors.format.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="date"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      value={dayjs(field.value)}
                      onChange={(newValue) =>
                        field.onChange(newValue?.toDate() || new Date())
                      }
                      name={field.name}
                      label="Date"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.date,
                          helperText: errors.date?.message,
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="imageUrl"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Image URL"
                      error={!!errors.imageUrl}
                      helperText={errors.imageUrl?.message}
                    />
                  )}
                />
              </Grid>

              {/* Showtimes */}
              <Grid size={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Showtimes
                </Typography>
                <Box display="flex" gap={1} mb={1} alignItems="center">
                  <FormControl sx={{ minWidth: 80 }}>
                    <InputLabel>Hour</InputLabel>
                    <Select
                      value={selectedHour}
                      label="Hour"
                      onChange={(e) =>
                        setSelectedHour(e.target.value as number)
                      }
                      error={!!errors.times}
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(
                        (hour) => (
                          <MenuItem key={hour} value={hour}>
                            {hour}
                          </MenuItem>
                        )
                      )}
                    </Select>
                  </FormControl>
                  <Typography variant="h6">:</Typography>
                  <FormControl sx={{ minWidth: 80 }}>
                    <InputLabel>Min</InputLabel>
                    <Select
                      value={selectedMinute}
                      label="Min"
                      onChange={(e) =>
                        setSelectedMinute(e.target.value as number)
                      }
                      error={!!errors.times}
                    >
                      {Array.from({ length: 12 }, (_, i) => i * 5).map(
                        (minute) => (
                          <MenuItem key={minute} value={minute}>
                            {minute.toString().padStart(2, "0")}
                          </MenuItem>
                        )
                      )}
                    </Select>
                  </FormControl>
                  <FormControl sx={{ minWidth: 80 }}>
                    <InputLabel>Period</InputLabel>
                    <Select
                      value={selectedPeriod}
                      label="Period"
                      onChange={(e) =>
                        setSelectedPeriod(e.target.value as "AM" | "PM")
                      }
                      error={!!errors.times}
                    >
                      <MenuItem value="AM">AM</MenuItem>
                      <MenuItem value="PM">PM</MenuItem>
                    </Select>
                  </FormControl>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      const minuteStr =
                        selectedMinute === 0
                          ? ""
                          : `:${selectedMinute.toString().padStart(2, "0")}`;
                      const timeString = `${selectedHour}${minuteStr}${selectedPeriod.toLowerCase()}`;
                      appendTime({ value: timeString });
                    }}
                    sx={{ height: "56px" }}
                  >
                    Add
                  </Button>
                </Box>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {timeFields.map((field, index) => (
                    <Chip
                      key={field.id}
                      label={field.value}
                      onDelete={() => removeTime(index)}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Stack>
                {errors.times && (
                  <Typography variant="caption" color="error">
                    {errors.times.message}
                  </Typography>
                )}
              </Grid>

              {/* Genres */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Genres
                </Typography>
                <Box display="flex" gap={1} mb={1}>
                  <FormControl fullWidth>
                    <InputLabel>Genre</InputLabel>
                    <Select
                      value={genreInput}
                      label="Genre"
                      onChange={(e) => setGenreInput(e.target.value)}
                    >
                      {genres.map((genre) => (
                        <MenuItem key={genre} value={genre}>
                          {genre}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button
                    variant="outlined"
                    onClick={handleAddGenre}
                    disabled={!genreInput.trim()}
                  >
                    Add
                  </Button>
                </Box>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {genreFields.map((field, index) => (
                    <Chip
                      key={field.id}
                      label={field.value}
                      onDelete={() => removeGenre(index)}
                      color="secondary"
                      variant="outlined"
                    />
                  ))}
                </Stack>
              </Grid>

              {/* Accessibility */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Accessibility Features
                </Typography>
                <Box display="flex" gap={1} mb={1}>
                  <FormControl fullWidth>
                    <InputLabel>Accessibility Feature</InputLabel>
                    <Select
                      value={accessibilityInput}
                      label="Accessibility Feature"
                      onChange={(e) => setAccessibilityInput(e.target.value)}
                    >
                      {accessibilityOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button
                    variant="outlined"
                    onClick={handleAddAccessibility}
                    disabled={!accessibilityInput.trim()}
                  >
                    Add
                  </Button>
                </Box>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {accessibilityFields.map((field, index) => (
                    <Chip
                      key={field.id}
                      label={field.value}
                      onDelete={() => removeAccessibility(index)}
                      color="success"
                      variant="outlined"
                    />
                  ))}
                </Stack>
              </Grid>

              {/* Discount Options */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Discount Options
                </Typography>
                <Box display="flex" gap={1} mb={1}>
                  <FormControl fullWidth>
                    <InputLabel>Discount</InputLabel>
                    <Select
                      value={discountInput}
                      label="Discount"
                      onChange={(e) => setDiscountInput(e.target.value)}
                    >
                      {DISCOUNT_OPTIONS.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button
                    variant="outlined"
                    onClick={handleAddDiscount}
                    disabled={!discountInput.trim()}
                  >
                    Add
                  </Button>
                </Box>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {discountFields.map((field, index) => (
                    <Chip
                      key={field.id}
                      label={field.value}
                      onDelete={() => removeDiscount(index)}
                      color="warning"
                      variant="outlined"
                    />
                  ))}
                </Stack>
              </Grid>

              {/* Media & Links */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="trailerUrl"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Trailer URL"
                      error={!!errors.trailerUrl}
                      helperText={errors.trailerUrl?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="imdbId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="IMDb ID"
                      placeholder="tt1234567"
                      error={!!errors.imdbId}
                      helperText={errors.imdbId?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="rottenTomatoesId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Rotten Tomatoes ID"
                      error={!!errors.rottenTomatoesId}
                      helperText={errors.rottenTomatoesId?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </form>
        </Paper>

        {/* Data Source Indicator */}
        {movieData && (
          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary">
              Movie information enhanced with data from{" "}
              <a
                href="https://www.omdbapi.com/"
                style={{ cursor: "pointer", color: "white" }}
                target="_blank"
                rel="noopener noreferrer"
              >
                www.omdb.com
              </a>
            </Typography>
          </Box>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-event-dialog-title"
        aria-describedby="delete-event-dialog-description"
      >
        <DialogTitle id="delete-event-dialog-title">
          Confirm Delete Event
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-event-dialog-description">
            Are you sure you want to delete "{displayTitle}"? This action cannot
            be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            autoFocus
            disabled={submitting}
          >
            Delete Event
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};
