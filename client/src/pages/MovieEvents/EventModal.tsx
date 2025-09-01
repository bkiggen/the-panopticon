import {
  Box,
  Chip,
  Typography,
  Modal,
  Paper,
  Button,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import HeadphonesIcon from "@mui/icons-material/Headphones";
import { formatDate, hasValidImage } from "@/utils/general";
import type { MovieEvent } from "@prismaTypes";

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

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
          maxHeight: "90%",
          overflow: "auto",
          p: 4,
          outline: "none",
        }}
      >
        {selectedEvent && hasValidImage(selectedEvent.imageUrl) && (
          <Box sx={{ mb: 3, textAlign: "center" }}>
            <img
              src={selectedEvent.imageUrl}
              alt={selectedEvent.title}
              style={{
                maxWidth: "100%",
                height: "auto",
                maxHeight: 400,
                objectFit: "contain",
              }}
            />
          </Box>
        )}

        <Typography variant="h4" gutterBottom>
          {selectedEvent?.title}
        </Typography>

        <Typography variant="h6" color="text.secondary" gutterBottom>
          {selectedEvent && formatDate(selectedEvent.date, isMobile)}
        </Typography>

        {/* All showtimes */}
        <Box sx={{ my: 3 }}>
          <Typography variant="h6" gutterBottom>
            Showtimes
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {selectedEvent?.times.map((time, index) => (
              <Chip key={index} label={time} variant="outlined" />
            ))}
          </Box>
        </Box>

        {/* Theater and format info */}
        <Box sx={{ my: 3 }}>
          <Typography variant="h6" gutterBottom>
            Details
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Chip
              label={selectedEvent?.theatre}
              color="primary"
              variant="filled"
            />
            <Chip
              label={selectedEvent?.format}
              color="info"
              variant="outlined"
            />
          </Stack>

          {selectedEvent?.accessibility &&
            selectedEvent.accessibility.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Accessibility Features
                </Typography>
                <Stack direction="row" spacing={1}>
                  {selectedEvent.accessibility.map((feature, index) => (
                    <Chip
                      key={index}
                      label={feature}
                      color="success"
                      variant="outlined"
                      size="small"
                      avatar={
                        <HeadphonesIcon sx={{ "*": { color: "#4caf50" } }} />
                      }
                    />
                  ))}
                </Stack>
              </Box>
            )}
        </Box>

        <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
          <Button onClick={onClose} variant="contained">
            Close
          </Button>
        </Box>
      </Paper>
    </Modal>
  );
};
