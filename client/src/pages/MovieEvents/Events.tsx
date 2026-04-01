import {
  Box,
  Card,
  CardContent,
  Chip,
  Typography,
  useTheme,
  useMediaQuery,
  Stack,
} from "@mui/material";
import { useState } from "react";
import { theatreInfo } from "@/lib/theatreInfo";
import HeadphonesIcon from "@mui/icons-material/Headphones";
import GroupWorkIcon from "@mui/icons-material/GroupWork";
import AlbumIcon from "@mui/icons-material/Album";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import { formatDate } from "@/utils/general";
import type { MovieEventWithDataProps } from "@/types/types";
import { getBestData } from "@/utils/general";
import { EventModal } from "./Modal";

interface MovieEventCardsProps {
  data: MovieEventWithDataProps[];
  selectedGenres?: string[];
  selectedFormats?: string[];
  selectedTheatres?: string[];
  onGenreToggle?: (genre: string) => void;
  onFormatToggle?: (format: string) => void;
  onTheatreToggle?: (theatre: string) => void;
}

export const Events = ({
  data,
  selectedGenres = [],
  selectedFormats = [],
  selectedTheatres = [],
  onGenreToggle,
  onFormatToggle,
  onTheatreToggle,
}: MovieEventCardsProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] =
    useState<MovieEventWithDataProps | null>(null);

  const handleCardClick = (event: MovieEventWithDataProps) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedEvent(null);
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
          const displayImageUrl = getBestData(
            event.imageUrl,
            event.movieData?.imageUrl,
          );
          const isDarkMode = theme.palette.mode === "dark";

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
                flexDirection: "row",
                minHeight: 120,
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
                  {/* Poster - desktop */}
                  {!isMobile && (
                    <Box
                      sx={{
                        width: 80,
                        height: 120,
                        flexShrink: 0,
                        backgroundColor: isDarkMode ? "#333" : "#e0e0e0",
                        borderRadius: 1,
                        overflow: "hidden",
                      }}
                    >
                      {displayImageUrl && (
                        <img
                          src={displayImageUrl}
                          alt={event.title}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      )}
                    </Box>
                  )}

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
                    {/* Poster - mobile */}
                    {isMobile && (
                      <Box
                        sx={{
                          width: 60,
                          height: 90,
                          flexShrink: 0,
                          backgroundColor: isDarkMode ? "#333" : "#e0e0e0",
                          borderRadius: 1,
                          overflow: "hidden",
                          float: "left",
                          marginRight: 2,
                          marginBottom: 1,
                        }}
                      >
                        {displayImageUrl && (
                          <img
                            src={displayImageUrl}
                            alt={event.title}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        )}
                      </Box>
                    )}
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
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ flexWrap: "wrap" }}
                      >
                        {displayGenres.map((genre: string, index: number) => {
                          const isSelected = selectedGenres.includes(genre);
                          const isDarkMode = theme.palette.mode === "dark";

                          return (
                            <Chip
                              key={index}
                              label={genre}
                              variant={isSelected ? "filled" : "outlined"}
                              size="small"
                              clickable={!!onGenreToggle}
                              onClick={(e) => {
                                if (onGenreToggle) {
                                  e.stopPropagation();
                                  onGenreToggle(genre);
                                }
                              }}
                              sx={{
                                "*": {
                                  color: isSelected
                                    ? isDarkMode
                                      ? "#000"
                                      : "#000"
                                    : "#db4500ff",
                                },
                                borderColor: "#db4500ff",
                                backgroundColor: isSelected
                                  ? "#fff"
                                  : "transparent",
                                "&:hover": {
                                  backgroundColor: isSelected
                                    ? "#f5f5f5"
                                    : isDarkMode
                                      ? "#1a1a1a"
                                      : "#f5f5f5",
                                },
                              }}
                            />
                          );
                        })}
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
                      {(event.times as any[]).map(
                        (showtime: any, index: number) => {
                          // Handle both old format (string) and new format ({ time, ticketUrl })
                          const time =
                            typeof showtime === "string"
                              ? showtime
                              : showtime.time;
                          const ticketUrl =
                            typeof showtime === "object"
                              ? showtime.ticketUrl
                              : null;
                          const fallbackUrl =
                            event.detailUrl ||
                            theatreInfo[event.theatre]?.website;

                          return (
                            <Chip
                              key={index}
                              label={time}
                              size="small"
                              variant="outlined"
                              clickable
                              onClick={(e) => {
                                e.stopPropagation();
                                const url = ticketUrl || fallbackUrl;
                                if (url) {
                                  window.open(url, "_blank");
                                }
                              }}
                              sx={{ fontSize: "0.75rem" }}
                            />
                          );
                        },
                      )}
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
                    {(() => {
                      const isTheatreSelected = selectedTheatres.includes(
                        event.theatre,
                      );

                      return (
                        <Chip
                          label={event.theatre}
                          variant={isTheatreSelected ? "filled" : "filled"}
                          clickable={!!onTheatreToggle}
                          onClick={(e) => {
                            if (onTheatreToggle) {
                              e.stopPropagation();
                              onTheatreToggle(event.theatre);
                            }
                          }}
                          sx={{
                            fontWeight: "medium",
                            maxWidth: "100%",
                            backgroundColor: isTheatreSelected
                              ? "#fff"
                              : undefined,
                            color: isTheatreSelected ? "#000" : undefined,
                            "&:hover": {
                              backgroundColor: isTheatreSelected
                                ? "#f5f5f5"
                                : undefined,
                            },
                          }}
                        />
                      );
                    })()}
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 1,
                        justifyContent: isMobile ? "flex-start" : "flex-end",
                      }}
                    >
                      {(() => {
                        const isFormatSelected = selectedFormats.includes(
                          event.format,
                        );
                        const isDarkMode = theme.palette.mode === "dark";

                        // Format config
                        const formatPropMap: Record<
                          string,
                          {
                            label: string;
                            color: string;
                            icon: React.ReactElement;
                          }
                        > = {
                          Digital: {
                            label: "Digital",
                            color: "#87CEEB",
                            icon: (
                              <AlbumIcon sx={{ "*": { color: "#87CEEB" } }} />
                            ),
                          },
                          "16mm": {
                            label: "16mm",
                            color: "#35bea8ff",
                            icon: (
                              <GroupWorkIcon
                                sx={{ "*": { color: "#35bea8ff" } }}
                              />
                            ),
                          },
                          "35mm": {
                            label: "35mm",
                            color: "#35bea8ff",
                            icon: (
                              <GroupWorkIcon
                                sx={{ "*": { color: "#35bea8ff" } }}
                              />
                            ),
                          },
                          "70mm": {
                            label: "70mm",
                            color: "#ae61cdff",
                            icon: (
                              <GroupWorkIcon
                                sx={{ "*": { color: "#ae61cdff" } }}
                              />
                            ),
                          },
                          VHS: {
                            label: "VHS",
                            color: "#d4d28eff",
                            icon: (
                              <PlayCircleOutlineIcon
                                sx={{ "*": { color: "#d4d28eff" } }}
                              />
                            ),
                          },
                        };

                        const { label, color, icon } = formatPropMap[
                          event.format
                        ] || {
                          label: event.format,
                          color: undefined,
                        };

                        return (
                          <Chip
                            label={label}
                            size="small"
                            variant={isFormatSelected ? "filled" : "outlined"}
                            clickable={!!onFormatToggle}
                            onClick={(e) => {
                              if (onFormatToggle) {
                                e.stopPropagation();
                                onFormatToggle(event.format);
                              }
                            }}
                            avatar={icon}
                            sx={{
                              borderColor: isFormatSelected ? undefined : color,
                              color: isFormatSelected ? "#000" : color,
                              backgroundColor: isFormatSelected
                                ? "#fff"
                                : "transparent",
                              "&:hover": {
                                backgroundColor: isFormatSelected
                                  ? "#f5f5f5"
                                  : isDarkMode
                                    ? "#1a1a1a"
                                    : "#f5f5f5",
                              },
                              display: "flex",
                              alignItems: "center",
                            }}
                          />
                        );
                      })()}
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
