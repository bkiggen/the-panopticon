export const genres = [
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Family",
  "Fantasy",
  "Horror",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Thriller",
  "War",
  "Western",
] as const;

export type Genre = (typeof genres)[number];

export const isValidGenre = (genre: string): genre is Genre => {
  return genres.includes(genre as Genre);
};

// For form dropdowns
export const genreOptions = genres.map((genre) => ({
  label: genre,
  value: genre,
}));

// For filtering dropdowns (includes "All" option)
export const filterGenreOptions = [
  { label: "All", value: "All" },
  ...genreOptions,
];
