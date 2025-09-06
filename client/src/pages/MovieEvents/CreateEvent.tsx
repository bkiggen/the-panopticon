import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  Chip,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  FormHelperText,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { theatreInfo } from "@/lib/theatreInfo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import useMovieEventStore from "@/stores/movieEventStore";
import { formats } from "@/lib/formats";

interface CreateEventFormData {
  date: Date;
  title: string;
  times: { value: string }[];
  format: string;
  imageUrl: string;
  theatre: string;
  accessibility: { value: string }[];
}

const schema = yup.object().shape({
  date: yup.date().required("Date is required"),
  title: yup.string().required("Title is required"),
  times: yup
    .array()
    .of(yup.object({ value: yup.string().required() }))
    .min(1, "At least one showtime is required")
    .default([]),
  format: yup.string().required("Format is required"),
  imageUrl: yup.string().url("Must be a valid URL").optional().default(""),
  theatre: yup.string().required("Theatre is required"),
  accessibility: yup
    .array()
    .of(yup.object({ value: yup.string().required() }))
    .default([]),
});

export const CreateEvent = () => {
  const [accessibilityInput, setAccessibilityInput] = useState("");
  const [selectedHour, setSelectedHour] = useState<number>(12);
  const [selectedMinute, setSelectedMinute] = useState<number>(0);
  const [selectedPeriod, setSelectedPeriod] = useState<"AM" | "PM">("PM");

  const { createEvent, submitting, error } = useMovieEventStore();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateEventFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      date: dayjs().toDate(),
      title: "",
      times: [],
      format: "",
      imageUrl: "",
      theatre: "",
      accessibility: [],
    },
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
    fields: accessibilityFields,
    append: appendAccessibility,
    remove: removeAccessibility,
  } = useFieldArray({
    control,
    name: "accessibility",
  });

  const handleAddAccessibility = () => {
    if (accessibilityInput.trim()) {
      appendAccessibility({ value: accessibilityInput.trim() });
      setAccessibilityInput("");
    }
  };

  const onSubmit = async (data: CreateEventFormData) => {
    try {
      await createEvent({
        date: data.date,
        title: data.title,
        originalTitle: data.title,
        times: data.times.map((t) => t.value),
        format: data.format,
        imageUrl: data.imageUrl,
        theatre: data.theatre,
        accessibility: data.accessibility.map((a) => a.value),
      });

      reset();
      setAccessibilityInput("");
    } catch (error) {
      console.error("Failed to create event:", error);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ mx: "auto", py: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              <Grid size={12}>
                <Typography variant="h6" gutterBottom>
                  Add Event
                </Typography>
              </Grid>

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

              <Grid size={{ xs: 12, md: 12 }}>
                <Box>
                  {/* Time Picker */}
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

                  {/* Selected Times Display */}
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
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Box>
                  <Box display="flex" gap={1} mb={1}>
                    <FormControl fullWidth>
                      <InputLabel>Accessibility Features</InputLabel>
                      <Select
                        value={accessibilityInput}
                        label="Select Feature"
                        onChange={(e) => setAccessibilityInput(e.target.value)}
                      >
                        <MenuItem value="Open Captions">Open Captions</MenuItem>
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
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                </Box>
              </Grid>

              <Grid size={12} sx={{ mt: 3 }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={submitting}
                  startIcon={submitting ? <CircularProgress size={20} /> : null}
                >
                  {submitting ? "Creating..." : "Create Event"}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </LocalizationProvider>
  );
};
