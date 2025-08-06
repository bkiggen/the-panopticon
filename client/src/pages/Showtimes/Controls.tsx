import { useState, useEffect, useMemo } from "react";
import {
  Box,
  TextField,
  Autocomplete,
  Chip,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { Clear as ClearIcon } from "@mui/icons-material";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import type { MovieEvent } from "@prismaTypes";

interface ControlsProps {
  data: MovieEvent[] | null;
  onFilteredDataChange: (filteredData: MovieEvent[]) => void;
}

export const Controls = ({ data, onFilteredDataChange }: ControlsProps) => {
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMovies, setSelectedMovies] = useState<string[]>([]);
  const [selectedTheatres, setSelectedTheatres] = useState<string[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [selectedAccessibility, setSelectedAccessibility] = useState<string[]>(
    []
  );
  const [selectedDiscounts, setSelectedDiscounts] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [timeFilter, setTimeFilter] = useState("");

  // Extract unique values for filter options
  const filterOptions = useMemo(() => {
    if (!data)
      return {
        movies: [],
        theatres: [],
        formats: [],
        accessibility: [],
        discounts: [],
      };

    const movies = [...new Set(data.map((event) => event.title))].sort();
    const theatres = [...new Set(data.map((event) => event.theatre))].sort();
    const formats = [...new Set(data.map((event) => event.format))].sort();

    const accessibility = [
      ...new Set(data.flatMap((event) => event.accessibility || [])),
    ].sort();

    const discounts = [
      ...new Set(data.flatMap((event) => event.discount || [])),
    ].sort();

    return { movies, theatres, formats, accessibility, discounts };
  }, [data]);

  // Filter the data based on current filter states
  const filteredData = useMemo(() => {
    if (!data) return [];

    return data.filter((event) => {
      // Search term filter (title)
      if (
        searchTerm &&
        !event.title.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      // Movie selection filter
      if (selectedMovies.length > 0 && !selectedMovies.includes(event.title)) {
        return false;
      }

      // Theatre filter
      if (
        selectedTheatres.length > 0 &&
        !selectedTheatres.includes(event.theatre)
      ) {
        return false;
      }

      // Format filter
      if (
        selectedFormats.length > 0 &&
        !selectedFormats.includes(event.format)
      ) {
        return false;
      }

      // Accessibility filter
      if (selectedAccessibility.length > 0) {
        const hasAccessibility = selectedAccessibility.some((filter) =>
          event.accessibility?.includes(filter)
        );
        if (!hasAccessibility) return false;
      }

      // Discount filter
      if (selectedDiscounts.length > 0) {
        const hasDiscount = selectedDiscounts.some((filter) =>
          event.discount?.includes(filter)
        );
        if (!hasDiscount) return false;
      }

      // Date range filter
      if (dateFrom) {
        const eventDate = new Date(event.date);
        const fromDate = new Date(dateFrom);
        if (eventDate < fromDate) return false;
      }
      if (dateTo) {
        const eventDate = new Date(event.date);
        const toDate = new Date(dateTo);
        if (eventDate > toDate) return false;
      }

      // Time filter
      if (timeFilter) {
        const hasTimeInRange = event.times.some((time) => {
          const hour = parseInt(time.split(":")[0]);
          switch (timeFilter) {
            case "morning":
              return hour >= 6 && hour < 12;
            case "afternoon":
              return hour >= 12 && hour < 18;
            case "evening":
              return hour >= 18 && hour < 24;
            case "latenight":
              return hour >= 0 && hour < 6;
            default:
              return true;
          }
        });
        if (!hasTimeInRange) return false;
      }

      return true;
    });
  }, [
    data,
    searchTerm,
    selectedMovies,
    selectedTheatres,
    selectedFormats,
    selectedAccessibility,
    selectedDiscounts,
    dateFrom,
    dateTo,
    timeFilter,
  ]);

  // Update parent component when filtered data changes
  useEffect(() => {
    onFilteredDataChange(filteredData);
  }, [filteredData, onFilteredDataChange]);

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedMovies([]);
    setSelectedTheatres([]);
    setSelectedFormats([]);
    setSelectedAccessibility([]);
    setSelectedDiscounts([]);
    setDateFrom("");
    setDateTo("");
    setTimeFilter("");
  };

  const hasActiveFilters =
    searchTerm ||
    selectedMovies.length > 0 ||
    selectedTheatres.length > 0 ||
    selectedFormats.length > 0 ||
    selectedAccessibility.length > 0 ||
    selectedDiscounts.length > 0 ||
    dateFrom ||
    dateTo ||
    timeFilter;

  return (
    <Accordion sx={{ border: "none", boxShadow: "none" }}>
      <AccordionSummary expandIcon={<FilterAltIcon />}></AccordionSummary>
      <AccordionDetails sx={{ backgroundColor: "white", pt: 0 }}>
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            {hasActiveFilters && (
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={clearAllFilters}
                size="small"
              >
                Clear All Filters
              </Button>
            )}
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Row 1: Search and Time */}
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Box sx={{ flex: 1, minWidth: 200 }}>
                <TextField
                  fullWidth
                  label="Search Movies"
                  variant="outlined"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Type movie title..."
                />
              </Box>
            </Box>

            {/* Row 2: Date Range */}
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Box sx={{ flex: 1, minWidth: 200 }}>
                <TextField
                  fullWidth
                  label="From Date"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
              <Box sx={{ flex: 1, minWidth: 200 }}>
                <TextField
                  fullWidth
                  label="To Date"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            </Box>

            {/* Row 3: Movie and Theatre Selection */}
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Box sx={{ flex: 1, minWidth: 250 }}>
                <Autocomplete
                  multiple
                  options={filterOptions.movies}
                  value={selectedMovies}
                  onChange={(_, newValue) => setSelectedMovies(newValue)}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        variant="outlined"
                        label={option}
                        {...getTagProps({ index })}
                        key={option}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Movies"
                      placeholder="Choose movies..."
                    />
                  )}
                />
              </Box>
              <Box sx={{ flex: 1, minWidth: 250 }}>
                <Autocomplete
                  multiple
                  options={filterOptions.theatres}
                  value={selectedTheatres}
                  onChange={(_, newValue) => setSelectedTheatres(newValue)}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        variant="outlined"
                        label={option}
                        {...getTagProps({ index })}
                        key={option}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Theatres"
                      placeholder="Choose theatres..."
                    />
                  )}
                />
              </Box>
            </Box>

            {/* Row 4: Format, Accessibility, Discounts */}
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Box sx={{ flex: 1, minWidth: 180 }}>
                <Autocomplete
                  multiple
                  options={filterOptions.formats}
                  value={selectedFormats}
                  onChange={(_, newValue) => setSelectedFormats(newValue)}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        variant="outlined"
                        label={option}
                        {...getTagProps({ index })}
                        key={option}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Format"
                      placeholder="Select formats..."
                    />
                  )}
                />
              </Box>
              <Box sx={{ flex: 1, minWidth: 180 }}>
                <Autocomplete
                  multiple
                  options={filterOptions.accessibility}
                  value={selectedAccessibility}
                  onChange={(_, newValue) => setSelectedAccessibility(newValue)}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        variant="outlined"
                        color="success"
                        label={option}
                        {...getTagProps({ index })}
                        key={option}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Accessibility"
                      placeholder="Select features..."
                    />
                  )}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};
