import { useState, useCallback } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { Controls } from "./Controls";
import { Table } from "./Table";
import { useMovieData } from "./useMovieData";
import type { MovieEvent } from "../../models/MovieEvent";
import { Box, Alert, Button, Stack } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

export const Showtimes = () => {
  const {
    cinema21Data,
    laurelhurstData,
    combinedData,
    loading,
    error,
    cinema21Error,
    laurelhurstError,
    refetchAll,
  } = useMovieData();

  const [filteredData, setFilteredData] = useState<MovieEvent[]>([]);

  const handleFilteredDataChange = useCallback((filtered: MovieEvent[]) => {
    setFilteredData(filtered);
  }, []);

  const handleRefresh = useCallback(async () => {
    await refetchAll();
  }, [refetchAll]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 2, pt: 10 }}>
        <CircularProgress size={200} sx={{ color: "black" }} />
      </Box>
    );
  }

  // Show partial errors but still render available data
  const hasPartialData = cinema21Data || laurelhurstData;
  const hasCompleteError = cinema21Error && laurelhurstError;

  if (hasCompleteError && !hasPartialData) {
    return (
      <div className="p-8">
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading data: {error}
          <div className="mt-2 text-sm">
            Make sure cinema21.json and laurelhurst.json are in the public/data
            folder
          </div>
        </Alert>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <Box sx={{ paddingBottom: "80px", marginTop: "40px" }}>
      {/* Show partial error warnings */}
      {(cinema21Error || laurelhurstError) && (
        <Stack spacing={1} sx={{ mb: 2 }}>
          {cinema21Error && (
            <Alert severity="warning">
              Cinema 21 data failed to load: {cinema21Error}
            </Alert>
          )}
          {laurelhurstError && (
            <Alert severity="warning">
              Laurelhurst Theater data failed to load: {laurelhurstError}
            </Alert>
          )}
        </Stack>
      )}
      <Controls
        data={combinedData}
        onFilteredDataChange={handleFilteredDataChange}
      />
      <Table data={filteredData} />
    </Box>
  );
};
