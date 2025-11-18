// src/stores/movieDataStore.ts
import { create } from "zustand";
import {
  MovieDataService,
  type MovieDataFilters,
} from "../services/movieDataService";

export interface MovieDataProps {
  id: number;
  title: string;
  originalTitle: string;
  description?: string;
  imageUrl?: string;
  trailerUrl?: string;
  omdbId?: string;
  imdbId?: string;
  rottenTomatoesId?: string;
  genres: string[];
  movieEvents?: any[]; // Related movie events
  createdAt: string;
  updatedAt: string;
}

interface MovieDataState {
  // State
  movieData: MovieDataProps[];
  selectedMovieData: MovieDataProps | null;
  loading: boolean;
  submitting: boolean;
  error: string | null;
  filters: MovieDataFilters;

  // Pagination state
  currentPage: number;
  pageSize: number;
  totalMovieData: number;
  totalPages: number;

  // Selection state for bulk operations
  selectedIds: number[];

  // Computed getters
  allGenres: string[];

  // Actions (synchronous state updates)
  setMovieData: (movieData: MovieDataProps[]) => void;
  setSelectedMovieData: (movieData: MovieDataProps | null) => void;
  setLoading: (loading: boolean) => void;
  setSubmitting: (submitting: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: MovieDataFilters) => void;
  setPagination: (
    page: number,
    pageSize: number,
    total: number,
    totalPages: number
  ) => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSelectedIds: (ids: number[]) => void;
  toggleSelectedId: (id: number) => void;
  clearSelection: () => void;
  clearError: () => void;

  // Thunks (asynchronous business logic)
  fetchMovieData: (
    filters?: MovieDataFilters,
    page?: number,
    limit?: number
  ) => Promise<void>;
  fetchMovieDataById: (id: number) => Promise<void>;
  createMovieData: (data: any) => Promise<void>;
  updateMovieData: (id: number, data: Partial<MovieDataProps>) => Promise<void>;
  deleteMovieData: (id: number) => Promise<void>;
  bulkDeleteMovieData: (ids: number[]) => Promise<void>;
  refreshMovieData: () => Promise<void>;
  goToPage: (page: number) => Promise<void>;
  changePageSize: (pageSize: number) => Promise<void>;
}

const useMovieDataStore = create<MovieDataState>((set, get) => ({
  // Initial state
  movieData: [],
  selectedMovieData: null,
  loading: false,
  submitting: false,
  error: null,
  filters: {},

  // Pagination initial state
  currentPage: 1,
  pageSize: 25,
  totalMovieData: 0,
  totalPages: 0,

  // Selection state
  selectedIds: [],

  // Computed getters
  get allGenres() {
    const movieData = get().movieData;
    const genreSet = new Set<string>();
    movieData.forEach((movie) => {
      movie.genres.forEach((genre) => genreSet.add(genre));
    });
    return Array.from(genreSet).sort();
  },

  // Synchronous actions
  setMovieData: (movieData) => set({ movieData }),
  setSelectedMovieData: (selectedMovieData) => set({ selectedMovieData }),
  setLoading: (loading) => set({ loading }),
  setSubmitting: (submitting) => set({ submitting }),
  setError: (error) => set({ error }),
  setFilters: (filters) => set({ filters }),
  setPagination: (currentPage, pageSize, totalMovieData, totalPages) =>
    set({ currentPage, pageSize, totalMovieData, totalPages }),
  setCurrentPage: (currentPage) => set({ currentPage }),
  setPageSize: (pageSize) => set({ pageSize }),
  setSelectedIds: (selectedIds) => set({ selectedIds }),
  toggleSelectedId: (id) => {
    const state = get();
    const isSelected = state.selectedIds.includes(id);
    const newSelectedIds = isSelected
      ? state.selectedIds.filter((selectedId) => selectedId !== id)
      : [...state.selectedIds, id];
    set({ selectedIds: newSelectedIds });
  },
  clearSelection: () => set({ selectedIds: [] }),
  clearError: () => set({ error: null }),

  // Async actions
  fetchMovieData: async (filters = {}, page, limit) => {
    const state = get();
    const currentPage = page ?? state.currentPage;
    const pageSize = limit ?? state.pageSize;

    try {
      state.setLoading(true);
      state.clearError();
      state.setFilters(filters);

      const result = await MovieDataService.getAll(
        filters,
        currentPage,
        pageSize
      );

      state.setMovieData(result.movieData || result.data || []);
      state.setPagination(
        currentPage,
        pageSize,
        result.total || 0,
        result.totalPages || 0
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch movie data";
      state.setError(errorMessage);
      console.error("Error fetching movie data:", error);
    } finally {
      state.setLoading(false);
    }
  },

  fetchMovieDataById: async (id: number) => {
    const state = get();

    try {
      state.setLoading(true);
      state.clearError();

      const movieData = await MovieDataService.getById(id);
      state.setSelectedMovieData(movieData);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch movie data";
      state.setError(errorMessage);
      console.error("Error fetching movie data:", error);
    } finally {
      state.setLoading(false);
    }
  },

  createMovieData: async (data) => {
    const state = get();

    try {
      state.setSubmitting(true);
      state.clearError();

      await MovieDataService.create(data);
      await state.refreshMovieData();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create movie data";
      state.setError(errorMessage);
      console.error("Error creating movie data:", error);
      throw error;
    } finally {
      state.setSubmitting(false);
    }
  },

  updateMovieData: async (id: number, data: Partial<MovieDataProps>) => {
    const state = get();

    try {
      state.setSubmitting(true);
      state.clearError();

      const updatedMovieData = await MovieDataService.update(id, data);

      // Update local state
      const currentMovieData = state.movieData;
      const updatedData = currentMovieData.map((movie) =>
        movie.id === id ? updatedMovieData : movie
      );

      state.setMovieData(updatedData);

      // Update selected movie data if it's the one being updated
      if (state.selectedMovieData?.id === id) {
        state.setSelectedMovieData(updatedMovieData);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update movie data";
      state.setError(errorMessage);
      console.error("Error updating movie data:", error);
      throw error;
    } finally {
      state.setSubmitting(false);
    }
  },

  deleteMovieData: async (id: number) => {
    const state = get();

    try {
      state.setSubmitting(true);
      state.clearError();

      await MovieDataService.delete(id);
      await state.refreshMovieData();

      // Clear selected movie data if it's the one being deleted
      if (state.selectedMovieData?.id === id) {
        state.setSelectedMovieData(null);
      }

      // Remove from selection if selected
      state.setSelectedIds(
        state.selectedIds.filter((selectedId) => selectedId !== id)
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete movie data";
      state.setError(errorMessage);
      console.error("Error deleting movie data:", error);
      throw error;
    } finally {
      state.setSubmitting(false);
    }
  },

  bulkDeleteMovieData: async (ids: number[]) => {
    const state = get();

    try {
      state.setSubmitting(true);
      state.clearError();

      await MovieDataService.bulkDelete(ids);
      await state.refreshMovieData();

      // Clear selection after bulk delete
      state.clearSelection();

      // Clear selected movie data if it was deleted
      if (state.selectedMovieData && ids.includes(state.selectedMovieData.id)) {
        state.setSelectedMovieData(null);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to bulk delete movie data";
      state.setError(errorMessage);
      console.error("Error bulk deleting movie data:", error);
      throw error;
    } finally {
      state.setSubmitting(false);
    }
  },

  refreshMovieData: async () => {
    const state = get();
    await state.fetchMovieData(
      state.filters,
      state.currentPage,
      state.pageSize
    );
  },

  goToPage: async (page: number) => {
    const state = get();
    await state.fetchMovieData(state.filters, page, state.pageSize);
  },

  changePageSize: async (pageSize: number) => {
    const state = get();
    // Reset to page 1 when changing page size
    await state.fetchMovieData(state.filters, 1, pageSize);
  },
}));

export default useMovieDataStore;
