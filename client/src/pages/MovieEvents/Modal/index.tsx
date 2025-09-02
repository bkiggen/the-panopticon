import { useState } from "react";
import { Modal, Paper, Tabs, Tab, Box } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { MovieEvent } from "@prismaTypes";
import { EventDetail } from "./EventDetail";
import { MovieData } from "./MovieData"; // You'll need to create this component

type EventModalProps = {
  open: boolean;
  onClose: () => void;
  selectedEvent: MovieEvent | null;
};

export const EventModal = ({
  open,
  onClose,
  selectedEvent,
}: EventModalProps) => {
  const [tabValue, setTabValue] = useState(0);

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
            <Tab label="Showtimes" />
            <Tab label="Info" />
          </Tabs>
        </Box>
        {/* Tab Content */}
        <Box sx={{ flex: 1, overflow: "auto" }}>
          {tabValue === 0 && (
            <EventDetail onClose={onClose} selectedEvent={selectedEvent} />
          )}
          {tabValue === 1 && <MovieData selectedEvent={selectedEvent} />}
        </Box>
      </Paper>
    </Modal>
  );
};
