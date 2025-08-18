import { prisma } from "../app";
import { MovieEvent, Prisma } from "@prisma/client";

export interface MovieEventFilters {
  search?: string;
  theatres?: string[];
  formats?: string[];
  accessibility?: string[];
  startDate?: string;
  endDate?: string;
  timeFilter?: string;
}

export const getAllMovieEvents = async (
  filters: MovieEventFilters = {},
  page: number = 1,
  limit: number = 10
): Promise<{ events: MovieEvent[]; total: number; totalPages: number }> => {
  const skip = (page - 1) * limit;

  // Build the where clause based on filters
  const where: any = {};

  if (filters.search) {
    where.OR = [
      {
        title: {
          contains: filters.search,
          mode: "insensitive",
        },
      },
      {
        theatre: {
          contains: filters.search,
          mode: "insensitive",
        },
      },
    ];
  }

  // Theatre filter
  if (filters.theatres && filters.theatres.length > 0) {
    where.theatre = {
      in: filters.theatres,
    };
  }

  // Format filter
  if (filters.formats && filters.formats.length > 0) {
    where.format = {
      in: filters.formats,
    };
  }

  // Accessibility filter (check if array contains any of the selected options)
  if (filters.accessibility && filters.accessibility.length > 0) {
    where.accessibility = {
      hasSome: filters.accessibility,
    };
  }

  // Date range filter
  if (filters.startDate || filters.endDate) {
    where.date = {};
    if (filters.startDate) {
      where.date.gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      where.date.lte = new Date(filters.endDate);
    }
  }

  // Time filter (this is more complex - you might need to adjust based on your time format)
  if (filters.timeFilter) {
    // This assumes times are stored as strings like "7:30pm", "2:15pm", etc.
    // You'll need to adjust the logic based on your actual time format
    const timeConditions = getTimeFilterCondition(filters.timeFilter);
    if (timeConditions) {
      where.times = timeConditions;
    }
  }

  const [events, total] = await Promise.all([
    prisma.movieEvent.findMany({
      where,
      skip,
      take: limit,
      orderBy: { date: "asc" },
    }),
    prisma.movieEvent.count({ where }),
  ]);

  return {
    events,
    total,
    totalPages: Math.ceil(total / limit),
  };
};

// Helper function for time filtering - adjust based on your time format
function getTimeFilterCondition(timeFilter: string) {
  // This is a basic example - you'll need to adjust based on how times are stored
  switch (timeFilter) {
    case "morning":
      // Match times that contain morning indicators
      return {
        hasSome: [], // You'd need to define what constitutes morning times
      };
    case "afternoon":
      return {
        hasSome: [], // Define afternoon times
      };
    case "evening":
      return {
        hasSome: [], // Define evening times
      };
    default:
      return null;
  }
}

export const getMovieEventById = async (
  id: number
): Promise<MovieEvent | null> => {
  return await prisma.movieEvent.findUnique({
    where: { id },
  });
};

export const createMovieEvent = async (
  data: Prisma.MovieEventCreateInput
): Promise<MovieEvent> => {
  return await prisma.movieEvent.create({
    data,
  });
};

export const updateMovieEvent = async (
  id: number,
  data: Prisma.MovieEventUpdateInput
): Promise<MovieEvent> => {
  return await prisma.movieEvent.update({
    where: { id },
    data,
  });
};

export const deleteMovieEvent = async (id: number): Promise<MovieEvent> => {
  return await prisma.movieEvent.delete({
    where: { id },
  });
};
