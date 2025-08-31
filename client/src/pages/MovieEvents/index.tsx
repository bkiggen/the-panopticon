import { useCallback, useEffect } from "react";
import { Box, CircularProgress } from "@mui/material";
import useMovieEventStore from "@/stores/movieEventStore";
// import { Table } from "./Table";
import { Events } from "./Events";
import { Controls } from "./Controls";
import type { MovieEventFilters } from "@/../../models/MovieEventFilters";
import { Pagination } from "@/components/Pagination";

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

  useEffect(() => {
    fetchEvents();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFiltersChange = useCallback(
    (filters: MovieEventFilters) => {
      fetchEvents(filters);
    },
    [fetchEvents]
  );

  if (loading && events.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
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
          <Controls data={events} onFiltersChange={handleFiltersChange} />
        }
      />
      <Box sx={{ padding: "16px 0" }}>
        <Events data={events} />
      </Box>
    </Box>
  );
};
