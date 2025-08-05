import { useState, useCallback } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { Controls } from "./Controls";
import { Table } from "./Table";
import { useMovieData } from "./useMovieData";
import type { MovieEvent } from "../../models/MovieEvent";
import { Box } from "@mui/material";

export const Showtimes = () => {
  const { combinedData, loading } = useMovieData();

  const [filteredData, setFilteredData] = useState<MovieEvent[]>([]);

  const handleFilteredDataChange = useCallback((filtered: MovieEvent[]) => {
    setFilteredData(filtered);
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }
  return (
    <Box sx={{ paddingBottom: "80px", marginTop: "40px" }}>
      <Controls
        data={combinedData}
        onFilteredDataChange={handleFilteredDataChange}
      />
      <Table data={filteredData} />
    </Box>
  );
};
