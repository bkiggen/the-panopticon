import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Typography,
  useTheme,
  useMediaQuery,
  Stack,
} from "@mui/material";
import { useState } from "react";
import type { MovieEvent } from "@prismaTypes";
import { theatreInfo } from "@/lib/theatreInfo";
import { FormatChip } from "@/components/FormatChip";
import HeadphonesIcon from "@mui/icons-material/Headphones";
import { formatDate, hasValidImage } from "@/utils/general";
import type { MovieEventWithDataProps } from "@/types/types";
import { getBestData } from "@/utils/general";
import { EventModal } from "./Modal";

interface MovieEventCardsProps {
  data: MovieEventWithDataProps[];
}

export const Events = ({ data }: MovieEventCardsProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<MovieEvent | null>(null);

  const handleCardClick = (event: MovieEvent) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedEvent(null);
  };

  const handleTheatreClick = (event: React.MouseEvent, theatre: string) => {
    event.stopPropagation();

    const theatreWebsite = theatreInfo[theatre]?.website;
    if (theatreWebsite) {
      window.open(theatreWebsite, "_blank");
    }
  };

  if (!data || data.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No movie events found
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Stack spacing={2}>
        {data.map((event) => {
          const displayGenres =
            getBestData(event.genres, event.movieData?.genres) || [];

          return (
            <Card
              key={event.id}
              sx={{
                display: "flex",
                cursor: "pointer",
                transition: "all 0.2s ease-in-out",
                boxShadow: "none",
                "&:hover": {
                  boxShadow: theme.shadows[4],
                  backgroundColor: theme.palette.action.hover,
                },
                flexDirection: isMobile ? "column" : "row",
                minHeight: isMobile ? "auto" : 120,
              }}
              onClick={() => handleCardClick(event)}
            >
              {/* Content */}
              <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
                <CardContent
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    gap: 2,
                    pb: isMobile ? 2 : "16px !important",
                  }}
                >
                  {/* Left side - Title and Date */}
                  <Box
                    sx={{
                      display: "flex",
                      flex: isMobile ? "none" : 2,
                      flexDirection: "column",
                      gap: 1,
                      minWidth: 0, // Allows text to wrap properly
                    }}
                  >
                    <Typography
                      variant={isMobile ? "h6" : "h5"}
                      component="h2"
                      sx={{
                        fontWeight: "bold",
                        lineHeight: 1.2,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {event.title}
                    </Typography>

                    <Typography
                      variant="subtitle1"
                      color="text.secondary"
                      sx={{ mb: isMobile ? 2 : 0 }}
                    >
                      {formatDate(event.date, isMobile)}
                    </Typography>
                    {displayGenres.length > 0 && (
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {displayGenres.map((genre: string, index: number) => (
                          <Chip
                            key={index}
                            label={genre}
                            variant="outlined"
                            size="small"
                            sx={{
                              "*": { color: "#db4500ff" },
                              borderColor: "#db4500ff",
                            }}
                          />
                        ))}
                      </Stack>
                    )}
                  </Box>

                  {/* Center - Showtimes */}
                  <Box
                    sx={{
                      flex: isMobile ? "none" : 2,
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 0.5,
                        overflow: "hidden",
                      }}
                    >
                      {event.times.map((time, index) => (
                        <Chip
                          key={index}
                          label={time}
                          size="small"
                          variant="outlined"
                          clickable
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(
                              theatreInfo[event.theatre]?.website,
                              "_blank"
                            );
                          }}
                          sx={{ fontSize: "0.75rem" }}
                        />
                      ))}
                    </Box>
                  </Box>

                  {/* Right side - Theater and Format */}
                  <Box
                    sx={{
                      flex: isMobile ? "none" : 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: isMobile ? "flex-start" : "flex-end",
                      gap: 1,
                    }}
                  >
                    <Chip
                      label={event.theatre}
                      color="primary"
                      variant="filled"
                      onClick={(e) => handleTheatreClick(e, event.theatre)}
                      sx={{
                        fontWeight: "medium",
                        maxWidth: "100%",
                      }}
                    />
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 1,
                        justifyContent: isMobile ? "flex-start" : "flex-end",
                      }}
                    >
                      <FormatChip format={event.format} />
                      {event.accessibility?.map((feature, index) => (
                        <Chip
                          key={index}
                          label={feature}
                          size="small"
                          color="success"
                          variant="outlined"
                          sx={{ fontSize: "0.7rem" }}
                          avatar={
                            <HeadphonesIcon
                              sx={{ "*": { color: "#4caf50" } }}
                            />
                          }
                        />
                      ))}
                    </Box>
                  </Box>
                </CardContent>
              </Box>
            </Card>
          );
        })}
      </Stack>
      <EventModal
        open={modalOpen}
        onClose={handleModalClose}
        selectedEvent={selectedEvent}
      />
    </Box>
  );
};
