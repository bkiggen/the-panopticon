import { Box, Typography, Paper, Chip, Stack } from "@mui/material";
import type { MovieEventWithDataProps } from "@/types/types";
import { getBestData } from "@/utils/general";

type MovieDataProps = {
  selectedEvent: MovieEventWithDataProps | null;
};

export const MovieData = ({ selectedEvent }: MovieDataProps) => {
  if (!selectedEvent) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>No movie selected</Typography>
      </Box>
    );
  }

  const movieData = selectedEvent.movieData;

  const displayTitle =
    getBestData(selectedEvent.originalTitle, movieData?.originalTitle) ||
    selectedEvent.title;
  const displayDescription = getBestData(
    selectedEvent.description,
    movieData?.description
  );
  const displayGenres =
    getBestData(selectedEvent.genres, movieData?.genres) || [];
  const displayImageUrl = getBestData(
    selectedEvent.imageUrl,
    movieData?.imageUrl
  );
  const displayTrailerUrl = getBestData(
    selectedEvent.trailerUrl,
    movieData?.trailerUrl
  );

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        {displayTitle}
      </Typography>

      {/* Movie poster from either source */}
      {displayImageUrl && (
        <img
          src={displayImageUrl}
          alt={displayTitle}
          style={{
            maxWidth: "100%",
            width: "100%",
            height: "auto",
            objectFit: "contain",
          }}
        />
      )}

      {/* Technical Details */}
      <Paper sx={{ py: 3, mb: 3 }} elevation={1}>
        <Typography variant="h6" gutterBottom>
          Technical Details
        </Typography>

        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Format
            </Typography>
            <Chip
              label={selectedEvent.format}
              color="info"
              variant="outlined"
            />
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Theatre
            </Typography>
            <Chip label={selectedEvent.theatre} color="primary" />
          </Box>

          {displayGenres.length > 0 && (
            <Box>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Genres
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {displayGenres.map((genre: string, index: number) => (
                  <Chip
                    key={index}
                    label={genre}
                    color="secondary"
                    variant="outlined"
                    size="small"
                  />
                ))}
              </Stack>
            </Box>
          )}

          {selectedEvent.accessibility &&
            selectedEvent.accessibility.length > 0 && (
              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Accessibility Features
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {selectedEvent.accessibility.map((feature, index) => (
                    <Chip
                      key={index}
                      label={feature}
                      color="success"
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Stack>
              </Box>
            )}
        </Stack>
      </Paper>

      {/* Movie Information */}
      <Paper sx={{ py: 3, mb: 3 }} elevation={1}>
        <Typography variant="h6" gutterBottom>
          Synopsis
        </Typography>

        {displayDescription ? (
          <Typography variant="body1" sx={{ mb: 2 }}>
            {displayDescription}
          </Typography>
        ) : (
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            No description available
          </Typography>
        )}

        {displayTrailerUrl && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Trailer
            </Typography>
            <Chip
              label="Watch Trailer"
              color="primary"
              clickable
              onClick={() => window.open(displayTrailerUrl, "_blank")}
              variant="filled"
            />
          </Box>
        )}
      </Paper>

      {/* External Links */}
      {(selectedEvent.imdbId || movieData?.imdbId) && (
        <Paper sx={{ py: 3 }} elevation={1}>
          <Typography variant="h6" gutterBottom>
            External Links
          </Typography>

          <Stack direction="row" spacing={1}>
            {movieData?.imdbId && (
              <Chip
                label="IMDb"
                color="warning"
                clickable
                onClick={() =>
                  window.open(
                    `https://www.imdb.com/title/${movieData?.imdbId}`,
                    "_blank"
                  )
                }
                variant="outlined"
              />
            )}

            {movieData?.rottenTomatoesId && (
              <Chip
                label="Rotten Tomatoes"
                color="error"
                clickable
                onClick={() =>
                  window.open(
                    `https://www.rottentomatoes.com/m/${movieData?.rottenTomatoesId}`,
                    "_blank"
                  )
                }
                variant="outlined"
              />
            )}
          </Stack>
        </Paper>
      )}

      {/* Data Source Indicator */}
      {movieData && (
        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Typography variant="caption" color="text.secondary">
            Movie information enhanced with data from{" "}
            <a
              href="https://www.omdbapi.com/"
              style={{ cursor: "pointer", color: "white" }}
              target="_blank"
              rel="noopener noreferrer"
            >
              www.omdb.com
            </a>
          </Typography>
        </Box>
      )}
    </Box>
  );
};
