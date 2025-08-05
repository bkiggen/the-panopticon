import { useState, useEffect, useCallback } from "react";
import type { MovieEvent } from "../../models/MovieEvent";

export interface MovieDataState {
  cinema21Data: MovieEvent[] | null;
  laurelhurstData: MovieEvent[] | null;
  academyData: MovieEvent[] | null;
  combinedData: MovieEvent[] | null;
  hollywoodData: MovieEvent[] | null;
  tomorrowData: MovieEvent[] | null;
  loading: boolean;
  error: string | null;
}

export interface UseMovieDataReturn extends MovieDataState {
  refetchCinema21: () => Promise<void>;
  refetchLaurelhurst: () => Promise<void>;
  refetchAcademy: () => Promise<void>;
  refetchHollywood: () => Promise<void>;
  refetchAll: () => Promise<void>;
  refetchTomorrow: () => Promise<void>;
}

export const useMovieData = (): UseMovieDataReturn => {
  const [cinema21Data, setCinema21Data] = useState<MovieEvent[] | null>(null);
  const [laurelhurstData, setLaurelhurstData] = useState<MovieEvent[] | null>(
    null
  );
  const [hollywoodData, setHollywoodData] = useState<MovieEvent[] | null>(null);
  const [tomorrowData, setTomorrowData] = useState<MovieEvent[] | null>(null);
  const [academyData, setAcademyData] = useState<MovieEvent[] | null>(null);
  const [combinedData, setCombinedData] = useState<MovieEvent[] | null>(null);
  const [cinema21Loading, setCinema21Loading] = useState(true);
  const [laurelhurstLoading, setLaurelhurstLoading] = useState(true);
  const [academyLoading, setAcademyLoading] = useState(true);
  const [hollywoodLoading, setHollywoodLoading] = useState(true);
  const [tomorrowLoading, setTomorrowLoading] = useState(true);
  const [cinema21Error, setCinema21Error] = useState<string | null>(null);
  const [laurelhurstError, setLaurelhurstError] = useState<string | null>(null);
  const [academyError, setAcademyError] = useState<string | null>(null);
  const [hollywoodError, setHollywoodError] = useState<string | null>(null);
  const [tomorrowError, setTomorrowError] = useState<string | null>(null);

  // Computed loading state - true if any is loading
  const loading =
    cinema21Loading ||
    laurelhurstLoading ||
    academyLoading ||
    hollywoodLoading ||
    tomorrowLoading;

  // Computed error state - combines all errors
  const error = (() => {
    const errors = [];
    if (cinema21Error) errors.push(`Cinema 21: ${cinema21Error}`);
    if (laurelhurstError) errors.push(`Laurelhurst: ${laurelhurstError}`);
    if (academyError) errors.push(`Academy: ${academyError}`);
    if (hollywoodError) errors.push(`Hollywood: ${hollywoodError}`);
    if (tomorrowError) errors.push(`Tomorrow: ${tomorrowError}`);
    return errors.length > 0 ? errors.join("; ") : null;
  })();

  const loadCinema21Data = useCallback(async () => {
    setCinema21Loading(true);
    setCinema21Error(null);
    try {
      const response = await fetch("/data/cinema21.json");
      if (!response.ok) {
        throw new Error(`Failed to load cinema21.json: ${response.status}`);
      }
      const data = await response.json();
      setCinema21Data(data);
    } catch (err: any) {
      const errorMessage =
        err.message || "Unknown error loading Cinema 21 data";
      setCinema21Error(errorMessage);
      console.error("Error loading Cinema 21 data:", err);
    } finally {
      setCinema21Loading(false);
    }
  }, []);

  const loadLaurelhurstData = useCallback(async () => {
    setLaurelhurstLoading(true);
    setLaurelhurstError(null);
    try {
      const response = await fetch("/data/laurelhurst.json");
      if (!response.ok) {
        throw new Error(`Failed to load laurelhurst.json: ${response.status}`);
      }
      const data = await response.json();
      setLaurelhurstData(data);
    } catch (err: any) {
      const errorMessage =
        err.message || "Unknown error loading Laurelhurst data";
      setLaurelhurstError(errorMessage);
      console.error("Error loading Laurelhurst data:", err);
    } finally {
      setLaurelhurstLoading(false);
    }
  }, []);

  const loadAcademyData = useCallback(async () => {
    setAcademyLoading(true);
    setAcademyError(null);
    try {
      const response = await fetch("/data/academy.json");
      if (!response.ok) {
        throw new Error(`Failed to load academy.json: ${response.status}`);
      }
      const data = await response.json();
      setAcademyData(data);
    } catch (err: any) {
      const errorMessage =
        err.message || "Unknown error loading Academy Theater data";
      setAcademyError(errorMessage);
      console.error("Error loading Academy Theater data:", err);
    } finally {
      setAcademyLoading(false);
    }
  }, []);

  const loadHollywoodData = useCallback(async () => {
    setHollywoodLoading(true);
    setHollywoodError(null);
    try {
      const response = await fetch("/data/hollywood.json");
      if (!response.ok) {
        throw new Error(`Failed to load hollywood.json: ${response.status}`);
      }
      const data = await response.json();
      setHollywoodData(data);
    } catch (err: any) {
      const errorMessage =
        err.message || "Unknown error loading Hollywood Theater data";
      setHollywoodError(errorMessage);
      console.error("Error loading Hollywood Theater data:", err);
    } finally {
      setHollywoodLoading(false);
    }
  }, []);

  const loadTomorrowData = useCallback(async () => {
    setTomorrowLoading(true);
    setTomorrowError(null);
    try {
      const response = await fetch("/data/tomorrow.json");
      if (!response.ok) {
        throw new Error(`Failed to load tomorrow.json: ${response.status}`);
      }
      const data = await response.json();
      setTomorrowData(data);
    } catch (err: any) {
      const errorMessage =
        err.message || "Unknown error loading Tomorrow Theater data";
      setTomorrowError(errorMessage);
      console.error("Error loading Tomorrow Theater data:", err);
    } finally {
      setTomorrowLoading(false);
    }
  }, []);

  const refetchAll = useCallback(async () => {
    await Promise.all([
      loadCinema21Data(),
      loadLaurelhurstData(),
      loadAcademyData(),
      loadHollywoodData(),
      loadTomorrowData(),
    ]);
  }, [
    loadCinema21Data,
    loadLaurelhurstData,
    loadAcademyData,
    loadHollywoodData,
    loadTomorrowData,
  ]);

  // Combine data when any theater data is loaded
  useEffect(() => {
    if (
      cinema21Data ||
      laurelhurstData ||
      academyData ||
      hollywoodData ||
      tomorrowData
    ) {
      const combined: MovieEvent[] = [];

      if (cinema21Data) {
        combined.push(...cinema21Data);
      }

      if (laurelhurstData) {
        combined.push(...laurelhurstData);
      }

      if (academyData) {
        combined.push(...academyData);
      }

      if (hollywoodData) {
        combined.push(...hollywoodData);
      }

      if (tomorrowData) {
        combined.push(...tomorrowData);
      }

      // Sort combined data by date, then by theater, then by title
      combined.sort((a, b) => {
        if (!a.date || !b.date) return 0; // Handle missing dates gracefully
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;

        const theaterCompare = a.theatre.localeCompare(b.theatre);
        if (theaterCompare !== 0) return theaterCompare;

        return a.title.localeCompare(b.title);
      });

      setCombinedData(combined);
    } else {
      setCombinedData(null);
    }
  }, [cinema21Data, laurelhurstData, academyData, hollywoodData, tomorrowData]);

  // Load data on mount
  useEffect(() => {
    loadCinema21Data();
    loadLaurelhurstData();
    loadAcademyData();
    loadHollywoodData();
    loadTomorrowData();
  }, [
    loadCinema21Data,
    loadLaurelhurstData,
    loadAcademyData,
    loadHollywoodData,
    loadTomorrowData,
  ]);

  return {
    cinema21Data,
    laurelhurstData,
    academyData,
    hollywoodData,
    tomorrowData,
    combinedData,
    loading,
    error,
    refetchCinema21: loadCinema21Data,
    refetchLaurelhurst: loadLaurelhurstData,
    refetchAcademy: loadAcademyData,
    refetchHollywood: loadHollywoodData,
    refetchTomorrow: loadTomorrowData,
    refetchAll,
  };
};
