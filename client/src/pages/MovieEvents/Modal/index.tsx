import { useState } from "react";
import { Modal, Paper, Tabs, Tab, Box } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { MovieEventWithDataProps } from "@/types/types";
import { AllShowings } from "./AllShowings";
import { MovieData } from "./MovieData";
import { AdminMovieData } from "./AdminMovieData";
import useSessionStore from "@/stores/sessionStore";

type EventModalProps = {
  open: boolean;
  onClose: () => void;
  selectedEvent: MovieEventWithDataProps | null;
};

export const EventModal = ({
  open,
  onClose,
  selectedEvent,
}: EventModalProps) => {
  const [tabValue, setTabValue] = useState(0);
const { isAuthenticated } = useSessionStore();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper
        sx={{
          width: "90%",
          maxWidth: 600,
          height: "90%",
          overflow: "hidden",
          outline: "none",
          display: "flex",
          position: "relative",
          flexDirection: "column",
        }}
      >
        <CloseIcon
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 12,
            right: 16,
            cursor: "pointer",
            zIndex: 100,
          }}
        />
        {/* Tabs Header */}
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="event tabs"
          >
            <Tab label="Info" />
            <Tab label="All Showings" />
          </Tabs>
        </Box>
        {/* Tab Content */}
        <Box sx={{ flex: 1, overflow: "auto" }}>
          {tabValue === 0 &&
            (isAuthenticated ? (
              <AdminMovieData selectedEvent={selectedEvent} onClose={onClose} />
            ) : (
              <MovieData selectedEvent={selectedEvent} onClose={onClose} />
            ))}
          {tabValue === 1 && <AllShowings selectedEvent={selectedEvent} />}
        </Box>
      </Paper>
    </Modal>
  );
};
