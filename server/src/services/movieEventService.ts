import { prisma } from "../app";
import { MovieEvent, Prisma } from "@prisma/client";

export const getAllMovieEvents = async (
  page: number = 1,
  limit: number = 10
): Promise<{ events: MovieEvent[]; total: number; totalPages: number }> => {
  const skip = (page - 1) * limit;

  const [events, total] = await Promise.all([
    prisma.movieEvent.findMany({
      skip,
      take: limit,
      orderBy: { date: "asc" },
    }),
    prisma.movieEvent.count(),
  ]);

  return {
    events,
    total,
    totalPages: Math.ceil(total / limit),
  };
};

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
