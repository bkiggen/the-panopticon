// src/stores/movieEventStore.ts
import { create } from "zustand";
import type { MovieEvent } from "@prismaTypes";
import {
  MovieEventService,
  type MovieEventFilters,
} from "../services/movieEventService";

interface MovieEventState {
  // State
  events: MovieEvent[];
  selectedEvent: MovieEvent | null;
  loading: boolean;
  error: string | null;
  filters: MovieEventFilters;

  // Computed getters
  theatres: string[];
  eventsByTheatre: Record<string, MovieEvent[]>;

  // Actions (synchronous state updates)
  setEvents: (events: MovieEvent[]) => void;
  setSelectedEvent: (event: MovieEvent | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: MovieEventFilters) => void;
  clearError: () => void;

  // Thunks (asynchronous business logic)
  fetchEvents: (filters?: MovieEventFilters) => Promise<void>;
  fetchEventById: (id: number) => Promise<void>;
  createEvent: (
    data: Omit<MovieEvent, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateEvent: (id: number, data: Partial<MovieEvent>) => Promise<void>;
  deleteEvent: (id: number) => Promise<void>;
  refreshEvents: () => Promise<void>;
}

const useMovieEventStore = create<MovieEventState>((set, get) => ({
  // Initial state
  events: [],
  selectedEvent: null,
  loading: false,
  error: null,
  filters: {},

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
    }, {} as Record<string, MovieEvent[]>);
  },

  // Synchronous actions
  setEvents: (events) => set({ events }),
  setSelectedEvent: (selectedEvent) => set({ selectedEvent }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setFilters: (filters) => set({ filters }),
  clearError: () => set({ error: null }),

  // Thunks (business logic)
  fetchEvents: async (filters = {}) => {
    const state = get();

    try {
      state.setLoading(true);
      state.clearError();
      state.setFilters(filters);

      // Call the pure API service
      const events = await MovieEventService.getAll(filters);

      // Transform/sort the data (business logic)
      const sortedEvents = events.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      });

      // Update state
      state.setEvents(sortedEvents);
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
      state.setLoading(true);
      state.clearError();

      const newEvent = await MovieEventService.create(data);

      // Update local state optimistically
      const currentEvents = state.events;
      const updatedEvents = [...currentEvents, newEvent].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      });

      state.setEvents(updatedEvents);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create event";
      state.setError(errorMessage);
      console.error("Error creating event:", error);
      throw error; // Re-throw so component can handle it
    } finally {
      state.setLoading(false);
    }
  },

  updateEvent: async (id: number, data: Partial<MovieEvent>) => {
    const state = get();

    try {
      state.setLoading(true);
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
      state.setLoading(false);
    }
  },

  deleteEvent: async (id: number) => {
    const state = get();

    try {
      state.setLoading(true);
      state.clearError();

      await MovieEventService.delete(id);

      // Update local state
      const currentEvents = state.events;
      const updatedEvents = currentEvents.filter((event) => event.id !== id);
      state.setEvents(updatedEvents);

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
      state.setLoading(false);
    }
  },

  refreshEvents: async () => {
    const state = get();
    await state.fetchEvents(state.filters);
  },
}));

export default useMovieEventStore;
