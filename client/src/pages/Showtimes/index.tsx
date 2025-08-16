import { useEffect } from "react";
import { Box, CircularProgress } from "@mui/material";
import useMovieEventStore from "@/stores/movieEventStore";
import { Table } from "./Table";
import { Controls } from "./Controls";
import type { MovieEventFilters } from "@/services/movieEventService";
import { Pagination } from "@/components/Pagination";

export const Showtimes = () => {
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
    <Box sx={{ paddingBottom: "80px", marginTop: "40px" }}>
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
            onFiltersChange={(filters: MovieEventFilters) => {
              console.log("🚀 ~ filters:", filters);
              fetchEvents(filters);
            }}
          />
        }
      />
      <Table data={events} />
    </Box>
  );
};
