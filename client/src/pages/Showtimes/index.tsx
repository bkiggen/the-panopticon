import { useEffect } from "react";
import { Box, CircularProgress } from "@mui/material";
import useMovieEventStore from "@/stores/movieEventStore";
import type { MovieEvent } from "@prismaTypes";
import { Table } from "./Table";
import { Controls } from "./Controls";
import { Pagination } from "@/components/Pagination"; // Import the new component

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
      />
      {/* <Controls
        data={events}
        onFilteredDataChange={(fetchData: MovieEvent[]) => {
          // fetchEvents(fetchData);
        }}
      /> */}
      <Table data={events} />
    </Box>
  );
};
