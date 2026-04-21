import { useCallback, useEffect, useState } from "react";
import { Box } from "@mui/material";
import { useSearchParams } from "react-router-dom";
import useMovieEventStore from "@/stores/movieEventStore";
import { Events } from "./Events";
import { Controls } from "./Controls";
import type { MovieEventFilters } from "@/../../models/MovieEventFilters";
import { Pagination } from "@/components/Pagination";
import useSessionStore from "@/stores/sessionStore";
import { CreateEvent } from "./CreateEvent";
import { MovieEventSkeletonList } from "@/components/LoadingSkeleton";
import { Navigation } from "@/components/Navigation";
import { CalendarView } from "@/components/CalendarView";

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
  const { isAuthenticated } = useSessionStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [initialFilters, setInitialFilters] = useState<MovieEventFilters>({});
  const [activeTab, setActiveTab] = useState<"listings" | "calendar">(
    "listings",
  );

  // Parse filters from URL
  const parseFiltersFromURL = useCallback((): MovieEventFilters => {
    const filters: MovieEventFilters = {};
    const search = searchParams.get("search");
    const theatres = searchParams.get("theatres");
    const formats = searchParams.get("formats");
    const accessibility = searchParams.get("accessibility");
    const genres = searchParams.get("genres");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const timeFilter = searchParams.get("timeFilter");

    if (search) filters.search = search;
    if (theatres) filters.theatres = theatres.split(",");
    if (formats) filters.formats = formats.split(",");
    if (accessibility) filters.accessibility = accessibility.split(",");
    if (genres) filters.genres = genres.split(",");
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (timeFilter) filters.timeFilter = timeFilter;

    return filters;
  }, [searchParams]);

  // Update URL with filters
  const updateURLFilters = useCallback(
    (filters: MovieEventFilters) => {
      const params = new URLSearchParams();

      if (filters.search) params.set("search", filters.search);
      if (filters.theatres?.length)
        params.set("theatres", filters.theatres.join(","));
      if (filters.formats?.length)
        params.set("formats", filters.formats.join(","));
      if (filters.accessibility?.length)
        params.set("accessibility", filters.accessibility.join(","));
      if (filters.genres?.length)
        params.set("genres", filters.genres.join(","));
      if (filters.startDate) params.set("startDate", filters.startDate);
      if (filters.endDate) params.set("endDate", filters.endDate);
      if (filters.timeFilter) params.set("timeFilter", filters.timeFilter);

      setSearchParams(params, { replace: true });
    },
    [setSearchParams],
  );

  // Load filters from URL or localStorage on mount
  useEffect(() => {
    try {
      // First check URL
      const urlFilters = parseFiltersFromURL();

      if (Object.keys(urlFilters).length > 0) {
        // URL has filters, use those
        setInitialFilters(urlFilters);
        fetchEvents(urlFilters);
      } else {
        // No URL filters, check localStorage
        const savedFilters = localStorage.getItem(FILTERS_STORAGE_KEY);
        if (savedFilters) {
          const parsedFilters = JSON.parse(savedFilters) as MovieEventFilters;
          setInitialFilters(parsedFilters);
          updateURLFilters(parsedFilters);
          fetchEvents(parsedFilters);
        } else {
          // No saved filters, fetch with defaults
          fetchEvents();
        }
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
          localStorage.removeItem(FILTERS_STORAGE_KEY);
        } else {
          localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters));
        }
      } catch (error) {
        console.warn("Failed to save filters:", error);
      }

      // Update initialFilters state so Controls component reflects changes
      setInitialFilters(filters);

      // Update URL
      updateURLFilters(filters);

      // Fetch events with new filters
      fetchEvents(filters);
    },
    [fetchEvents, updateURLFilters],
  );

  const handleGenreToggle = useCallback(
    (genre: string) => {
      const currentFilters = parseFiltersFromURL();
      const currentGenres = currentFilters.genres || [];

      const newGenres = currentGenres.includes(genre)
        ? currentGenres.filter((g) => g !== genre)
        : [...currentGenres, genre];

      const newFilters: MovieEventFilters = { ...currentFilters };

      if (newGenres.length > 0) {
        newFilters.genres = newGenres;
      } else {
        delete newFilters.genres;
      }

      handleFiltersChange(newFilters);
    },
    [parseFiltersFromURL, handleFiltersChange],
  );

  const handleFormatToggle = useCallback(
    (format: string) => {
      const currentFilters = parseFiltersFromURL();
      const currentFormats = currentFilters.formats || [];

      const newFormats = currentFormats.includes(format)
        ? currentFormats.filter((f) => f !== format)
        : [...currentFormats, format];

      const newFilters: MovieEventFilters = { ...currentFilters };

      if (newFormats.length > 0) {
        newFilters.formats = newFormats;
      } else {
        delete newFilters.formats;
      }

      handleFiltersChange(newFilters);
    },
    [parseFiltersFromURL, handleFiltersChange],
  );

  const handleTheatreToggle = useCallback(
    (theatre: string) => {
      const currentFilters = parseFiltersFromURL();
      const currentTheatres = currentFilters.theatres || [];

      const newTheatres = currentTheatres.includes(theatre)
        ? currentTheatres.filter((t) => t !== theatre)
        : [...currentTheatres, theatre];

      const newFilters: MovieEventFilters = { ...currentFilters };

      if (newTheatres.length > 0) {
        newFilters.theatres = newTheatres;
      } else {
        delete newFilters.theatres;
      }

      handleFiltersChange(newFilters);
    },
    [parseFiltersFromURL, handleFiltersChange],
  );

  const handleTheatreSelect = useCallback(
    (theatreName: string) => {
      // Clear all other filters and only apply theatre filter
      const newFilters: MovieEventFilters = {
        theatres: [theatreName],
      };
      handleFiltersChange(newFilters);
      setActiveTab("listings");
    },
    [handleFiltersChange],
  );

  if (loading && events.length === 0) {
    return (
      <>
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        <Box
          sx={{
            paddingBottom: "80px",
            marginTop: "40px",
            width: "90%",
            maxWidth: "1200px",
            marginX: "auto",
          }}
        >
          <MovieEventSkeletonList count={6} />
        </Box>
      </>
    );
  }

  return (
    <>
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === "listings" ? (
        <Box
          sx={{
            paddingBottom: "80px",
            marginTop: "40px",
            width: "90%",
            maxWidth: "1200px",
            marginX: "auto",
          }}
        >
          {isAuthenticated && <CreateEvent />}
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
            <Events
              data={events}
              selectedGenres={initialFilters.genres || []}
              selectedFormats={initialFilters.formats || []}
              selectedTheatres={initialFilters.theatres || []}
              onGenreToggle={handleGenreToggle}
              onFormatToggle={handleFormatToggle}
              onTheatreToggle={handleTheatreToggle}
            />
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
      ) : (
        <CalendarView filters={parseFiltersFromURL()} />
      )}
    </>
  );
};
