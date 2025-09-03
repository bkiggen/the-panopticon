import type { MovieEvent } from "@prismaTypes";

export type MovieEventWithDataProps = MovieEvent & { movieData: any };
