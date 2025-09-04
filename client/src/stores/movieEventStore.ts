// src/stores/movieEventStore.ts
import { create } from "zustand";
import type { MovieEvent } from "@prismaTypes";
import {
  MovieEventService,
  type MovieEventFilters,
} from "../services/movieEventService";
import { MovieEventWithDataProps } from "@/types/types";

interface MovieEventState {
  // State
  events: MovieEventWithDataProps[];
  selectedEvent: MovieEventWithDataProps | null;
  loading: boolean;
  submitting: boolean;
  error: string | null;
  filters: MovieEventFilters;

  // Pagination state
  currentPage: number;
  pageSize: number;
  totalEvents: number;
  totalPages: number;

  // Computed getters
  theatres: string[];
  eventsByTheatre: Record<string, MovieEventWithDataProps[]>;

  // Actions (synchronous state updates)
  setEvents: (events: MovieEventWithDataProps[]) => void;
  setSelectedEvent: (event: MovieEventWithDataProps | null) => void;
  setLoading: (loading: boolean) => void;
  setSubmitting: (submitting: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: MovieEventFilters) => void;
  setPagination: (
    page: number,
    pageSize: number,
    total: number,
    totalPages: number
  ) => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  clearError: () => void;

  // Thunks (asynchronous business logic)
  fetchEvents: (
    filters?: MovieEventFilters,
    page?: number,
    limit?: number
  ) => Promise<void>;
  fetchEventById: (id: number) => Promise<void>;
  createEvent: (
    data: Omit<MovieEvent, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateEvent: (id: number, data: Partial<MovieEvent>) => Promise<void>;
  deleteEvent: (id: number) => Promise<void>;
  refreshEvents: () => Promise<void>;
  goToPage: (page: number) => Promise<void>;
  changePageSize: (pageSize: number) => Promise<void>;
}

const useMovieEventStore = create<MovieEventState>((set, get) => ({
  // Initial state
  events: [],
  selectedEvent: null,
  loading: false,
  submitting: false,
  error: null,
  filters: {},

  // Pagination initial state
  currentPage: 1,
  pageSize: 100,
  totalEvents: 0,
  totalPages: 0,

  // Computed getters
  get theatres() {
    const events = get().events;
    return [...new Set(events.map((event) => event.theatre))].sort();
  },

  get eventsByTheatre() {
    const events = get().events;
    return events.reduce((acc, event) => {
      if (!acc[event.theatre]) {
        acc[event.theatre] = [];
      }
      acc[event.theatre].push(event);
      return acc;
    }, {} as Record<string, MovieEventWithDataProps[]>);
  },

  // Synchronous actions
  setEvents: (events) => set({ events }),
  setSelectedEvent: (selectedEvent) => set({ selectedEvent }),
  setLoading: (loading) => set({ loading }),
  setSubmitting: (submitting) => set({ submitting }),
  setError: (error) => set({ error }),
  setFilters: (filters) => set({ filters }),
  setPagination: (currentPage, pageSize, totalEvents, totalPages) =>
    set({ currentPage, pageSize, totalEvents, totalPages }),
  setCurrentPage: (currentPage) => set({ currentPage }),
  setPageSize: (pageSize) => set({ pageSize }),
  clearError: () => set({ error: null }),

  fetchEvents: async (filters = {}, page, limit) => {
    const state = get();
    const currentPage = page ?? state.currentPage;
    const pageSize = limit ?? state.pageSize;

    try {
      state.setLoading(true);
      state.clearError();
      state.setFilters(filters);

      const result = await MovieEventService.getAll(
        filters,
        currentPage,
        pageSize
      );

      state.setEvents(result.events);
      state.setPagination(
        currentPage,
        pageSize,
        result.total,
        result.totalPages
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch events";
      state.setError(errorMessage);
      console.error("Error fetching events:", error);
    } finally {
      state.setLoading(false);
    }
  },

  fetchEventById: async (id: number) => {
    const state = get();

    try {
      state.setLoading(true);
      state.clearError();

      const event = await MovieEventService.getById(id);
      state.setSelectedEvent(event);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch event";
      state.setError(errorMessage);
      console.error("Error fetching event:", error);
    } finally {
      state.setLoading(false);
    }
  },

  createEvent: async (data) => {
    const state = get();

    try {
      state.setSubmitting(true);
      state.clearError();

      await MovieEventService.create(data);

      // Refresh the current page to show updated data
      await state.refreshEvents();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create event";
      state.setError(errorMessage);
      console.error("Error creating event:", error);
      throw error; // Re-throw so component can handle it
    } finally {
      state.setSubmitting(false);
    }
  },

  updateEvent: async (id: number, data: Partial<MovieEventWithDataProps>) => {
    const state = get();

    try {
      state.setSubmitting(true);
      state.clearError();

      const updatedEvent = await MovieEventService.update(id, data);

      // Update local state
      const currentEvents = state.events;
      const updatedEvents = currentEvents.map((event) =>
        event.id === id ? updatedEvent : event
      );

      state.setEvents(updatedEvents);

      // Update selected event if it's the one being updated
      if (state.selectedEvent?.id === id) {
        state.setSelectedEvent(updatedEvent);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update event";
      state.setError(errorMessage);
      console.error("Error updating event:", error);
      throw error;
    } finally {
      state.setSubmitting(false);
    }
  },

  deleteEvent: async (id: number) => {
    const state = get();

    try {
      state.setSubmitting(true);
      state.clearError();

      await MovieEventService.delete(id);

      // Refresh the current page to show updated data
      await state.refreshEvents();

      // Clear selected event if it's the one being deleted
      if (state.selectedEvent?.id === id) {
        state.setSelectedEvent(null);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete event";
      state.setError(errorMessage);
      console.error("Error deleting event:", error);
      throw error;
    } finally {
      state.setSubmitting(false);
    }
  },

  refreshEvents: async () => {
    const state = get();
    await state.fetchEvents(state.filters, state.currentPage, state.pageSize);
  },

  // New pagination methods
  goToPage: async (page: number) => {
    const state = get();
    await state.fetchEvents(state.filters, page, state.pageSize);
  },

  changePageSize: async (pageSize: number) => {
    const state = get();
    // Reset to page 1 when changing page size
    await state.fetchEvents(state.filters, 1, pageSize);
  },
}));

export default useMovieEventStore;
