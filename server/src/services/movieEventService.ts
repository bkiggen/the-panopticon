import { prisma } from "../app";
import { MovieEvent, Prisma } from "@prisma/client";

export const getAllMovieEvents = async (): Promise<MovieEvent[]> => {
  return await prisma.movieEvent.findMany({
    orderBy: { date: "asc" },
  });
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
