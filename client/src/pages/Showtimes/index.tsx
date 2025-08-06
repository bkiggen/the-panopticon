import { useEffect } from "react";
import { Box, CircularProgress } from "@mui/material";
import useMovieEventStore from "@/stores/movieEventStore";
import type { MovieEvent } from "@prismaTypes";
import { Table } from "./Table";
import { Controls } from "./Controls";

export const Showtimes = () => {
  const { events, loading, fetchEvents } = useMovieEventStore();

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

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
      <Controls
        data={events}
        onFilteredDataChange={(fetchData: MovieEvent[]) =>
          fetchEvents(fetchData)
        }
      />
      <Table data={events} />
    </Box>
  );
};
