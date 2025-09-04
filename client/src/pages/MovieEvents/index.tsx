import { useCallback, useEffect, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import useMovieEventStore from "@/stores/movieEventStore";
import { Events } from "./Events";
import { Controls } from "./Controls";
import type { MovieEventFilters } from "@/../../models/MovieEventFilters";
import { Pagination } from "@/components/Pagination";

const FILTERS_STORAGE_KEY = "movieEventFilters";

export const MovieEvents = () => {
  const {
    events,
    totalEvents,
    totalPages,
    currentPage,
    pageSize,
    loading,
    fetchEvents,
    goToPage,
  } = useMovieEventStore();

  const [initialFilters, setInitialFilters] = useState<MovieEventFilters>({});

  // Load filters from localStorage on mount
  useEffect(() => {
    try {
      const savedFilters = localStorage.getItem(FILTERS_STORAGE_KEY);
      if (savedFilters) {
        const parsedFilters = JSON.parse(savedFilters) as MovieEventFilters;
        setInitialFilters(parsedFilters);
        // Fetch events with saved filters
        fetchEvents(parsedFilters);
      } else {
        // No saved filters, fetch with defaults
        fetchEvents();
      }
    } catch (error) {
      console.warn("Failed to load saved filters:", error);
      fetchEvents();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFiltersChange = useCallback(
    (filters: MovieEventFilters) => {
      // Save filters to localStorage
      try {
        if (Object.keys(filters).length === 0) {
          // If filters are empty, remove from localStorage
          localStorage.removeItem(FILTERS_STORAGE_KEY);
        } else {
          localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters));
        }
      } catch (error) {
        console.warn("Failed to save filters:", error);
      }

      // Fetch events with new filters
      fetchEvents(filters);
    },
    [fetchEvents]
  );

  if (loading && events.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        paddingBottom: "80px",
        marginTop: "40px",
        width: "90%",
        maxWidth: "1200px",
        marginX: "auto",
      }}
    >
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalEvents}
        pageSize={pageSize}
        onPageChange={goToPage}
        loading={loading}
        leftContent={
          <Controls
            data={events}
            onFiltersChange={handleFiltersChange}
            initialFilters={initialFilters}
          />
        }
      />
      <Box sx={{ padding: "16px 0" }}>
        <Events data={events} />
      </Box>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalEvents}
        pageSize={pageSize}
        onPageChange={goToPage}
        loading={loading}
      />
    </Box>
  );
};
