import { useState, useEffect, useCallback } from "react";
import { Controls } from "./Controls";
import { Table } from "./Table";
import type { MovieEvent } from "../../models/MovieEvent";
import { Box } from "@mui/material";

export const Showtimes = () => {
  const [cinema21Data, setCinema21Data] = useState<MovieEvent[] | null>(null);
  const [filteredData, setFilteredData] = useState<MovieEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCinema21Data = async () => {
      try {
        const response = await fetch("/data/cinema21.json");
        if (!response.ok) {
          throw new Error(`Failed to load cinema21.json: ${response.status}`);
        }
        const data = await response.json();
        setCinema21Data(data);
      } catch (err: any) {
        setError(err.message);
        console.error("Error loading cinema21 data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadCinema21Data();
  }, []);

  const handleFilteredDataChange = useCallback((filtered: MovieEvent[]) => {
    setFilteredData(filtered);
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        Error loading data: {error}
        <div className="mt-4 text-sm text-gray-600">
          Make sure cinema21.json is in the public folder
        </div>
      </div>
    );
  }

  return (
    <Box sx={{ paddingBottom: "80px", marginTop: "40px" }}>
      <Controls
        data={cinema21Data}
        onFilteredDataChange={handleFilteredDataChange}
      />
      <Table data={filteredData} />
    </Box>
  );
};
