import { useState, useMemo, useEffect } from "react";
import {
  Box,
  TextField,
  Autocomplete,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  Badge,
  Tooltip,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
} from "@mui/material";
import {
  Clear as ClearIcon,
  FilterAlt as FilterAltIcon,
} from "@mui/icons-material";
import type { MovieEvent } from "@prismaTypes";
import type { MovieEventFilters } from "@/services/movieEventService";
import { useDebounce } from "@/hooks/useDebonce";
import { theatreInfo } from "@/lib/theatreInfo";

interface ControlsProps {
  data: MovieEvent[] | null;
  onFiltersChange: (filters: MovieEventFilters) => void;
  initialFilters?: MovieEventFilters;
}

export const Controls = ({
  data,
  onFiltersChange,
  initialFilters = {},
}: ControlsProps) => {
  const [open, setOpen] = useState(false);

  // All available options - memoized to prevent recreation
  const allFormats = useMemo(() => ["Digital", "35mm", "70mm", "VHS"], []);
  const allAccessibility = useMemo(() => ["Open Captions"], []);

  // Filter states - initialize with any provided initial filters
  const [searchTerm, setSearchTerm] = useState(initialFilters.search || "");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [selectedTheatres, setSelectedTheatres] = useState<string[]>(
    initialFilters.theatres || []
  );
  const [selectedFormats, setSelectedFormats] = useState<string[]>(
    initialFilters.formats || allFormats
  );
  const [selectedAccessibility, setSelectedAccessibility] = useState<string[]>(
    initialFilters.accessibility || allAccessibility
  );
  const [dateFrom, setDateFrom] = useState(initialFilters.startDate || "");
  const [dateTo, setDateTo] = useState(initialFilters.endDate || "");
  const [timeFilter, setTimeFilter] = useState(initialFilters.timeFilter || "");

  // Track if this is the initial load to prevent calling onFiltersChange on mount
  const [hasInitialized, setHasInitialized] = useState(false);

  // Extract unique values for filter options
  const filterOptions = useMemo(() => {
    if (!data)
      return {
        theatres: [],
        formats: allFormats,
        accessibility: allAccessibility,
      };

    const theatres = Object.keys(theatreInfo);

    return { theatres, formats: allFormats, accessibility: allAccessibility };
  }, [data, allFormats, allAccessibility]);

  // Build current filters object
  const getCurrentFilters = (): MovieEventFilters => {
    const filters: MovieEventFilters = {};
    if (debouncedSearchTerm) filters.search = debouncedSearchTerm;
    if (selectedTheatres.length > 0) filters.theatres = selectedTheatres;
    // Only include format filter if not all formats are selected
    if (
      selectedFormats.length > 0 &&
      selectedFormats.length < allFormats.length
    ) {
      filters.formats = selectedFormats;
    }
    // Only include accessibility filter if not all accessibility options are selected
    if (
      selectedAccessibility.length > 0 &&
      selectedAccessibility.length < allAccessibility.length
    ) {
      filters.accessibility = selectedAccessibility;
    }
    if (dateFrom) filters.startDate = dateFrom;
    if (dateTo) filters.endDate = dateTo;
    if (timeFilter) filters.timeFilter = timeFilter;
    return filters;
  };

  // Only trigger search filter changes after debounce and after initial load
  useEffect(() => {
    if (!hasInitialized) {
      setHasInitialized(true);
      return;
    }

    const filters = getCurrentFilters();
    onFiltersChange(filters);
  }, [debouncedSearchTerm]); // Only search triggers automatic filter changes

  // Handle format checkbox change
  const handleFormatChange = (format: string, checked: boolean) => {
    if (checked) {
      setSelectedFormats((prev) => [...prev, format]);
    } else {
      setSelectedFormats((prev) => prev.filter((f) => f !== format));
    }
  };

  // Handle accessibility checkbox change
  const handleAccessibilityChange = (
    accessibility: string,
    checked: boolean
  ) => {
    if (checked) {
      setSelectedAccessibility((prev) => [...prev, accessibility]);
    } else {
      setSelectedAccessibility((prev) =>
        prev.filter((a) => a !== accessibility)
      );
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedTheatres([]);
    setSelectedFormats(allFormats);
    setSelectedAccessibility(allAccessibility);
    setDateFrom("");
    setDateTo("");
    setTimeFilter("");
    // Immediately apply cleared filters
    onFiltersChange({});
  };

  // Apply current filters when modal closes
  const applyFilters = () => {
    const filters = getCurrentFilters();
    onFiltersChange(filters);
    setOpen(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Count active filters (excluding format/accessibility if all are selected)
  const activeFilterCount = [
    debouncedSearchTerm,
    selectedTheatres.length > 0,
    selectedFormats.length < allFormats.length,
    selectedAccessibility.length < allAccessibility.length,
    dateFrom,
    dateTo,
    timeFilter,
  ].filter(Boolean).length;

  const hasActiveFilters = activeFilterCount > 0;

  return (
    <>
      {/* Search and Filter Controls */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Tooltip title="Filter events">
          <IconButton
            onClick={() => setOpen(true)}
            color={hasActiveFilters ? "primary" : "default"}
          >
            <Badge badgeContent={activeFilterCount} color="primary">
              <FilterAltIcon />
            </Badge>
          </IconButton>
        </Tooltip>
        <TextField
          label="Search Movies"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Type movie title..."
          sx={{ minWidth: 250 }}
        />
      </Box>

      {/* Filter Modal */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { minHeight: "60vh" },
        }}
      >
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 2 }}>
            {/* Row 1: Date Range */}
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

            {/* Row 2: Theatres */}
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
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

            {/* Row 3: Format and Accessibility Checkboxes */}
            <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {/* Format Checkboxes */}
              <Box sx={{ flex: 1, minWidth: 200 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Format
                </Typography>
                <FormGroup>
                  {filterOptions.formats.map((format) => (
                    <FormControlLabel
                      key={format}
                      control={
                        <Checkbox
                          checked={selectedFormats.includes(format)}
                          onChange={(e) =>
                            handleFormatChange(format, e.target.checked)
                          }
                          size="small"
                        />
                      }
                      label={format}
                    />
                  ))}
                </FormGroup>
              </Box>

              {/* Accessibility Checkboxes */}
              <Box sx={{ flex: 1, minWidth: 200 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Accessibility
                </Typography>
                <FormGroup>
                  {filterOptions.accessibility.map((accessibility) => (
                    <FormControlLabel
                      key={accessibility}
                      control={
                        <Checkbox
                          checked={selectedAccessibility.includes(
                            accessibility
                          )}
                          onChange={(e) =>
                            handleAccessibilityChange(
                              accessibility,
                              e.target.checked
                            )
                          }
                          size="small"
                          color="success"
                        />
                      }
                      label={accessibility}
                    />
                  ))}
                </FormGroup>
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          {hasActiveFilters && (
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={clearAllFilters}
            >
              Clear All Filters
            </Button>
          )}
          <Button variant="contained" onClick={applyFilters}>
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
