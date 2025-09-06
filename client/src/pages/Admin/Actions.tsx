import {
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Box,
} from "@mui/material";
import { useState } from "react";
import { AdminService } from "@/services/adminService";
import { MovieEventService } from "@/services/movieEventService";

const AVAILABLE_SCRAPERS = [
  { id: "cinema21", label: "Cinema 21" },
  { id: "academy", label: "Academy Theater" },
  { id: "laurelhurst", label: "Laurelhurst Theater" },
  { id: "tomorrow", label: "Tomorrow Theater" },
  { id: "stJohns", label: "St Johns Cinema" },
  { id: "clinton", label: "Clinton Street Theater" },
  { id: "cinemagic", label: "Cinemagic (unreliable)" },
  { id: "livingRoom", label: "Living Room Theaters" },
  { id: "omdb", label: "OMDb API" },
];

export const Actions = () => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [scraperDialogOpen, setScraperDialogOpen] = useState(false);
  const [selectedScrapers, setSelectedScrapers] = useState<string[]>(
    AVAILABLE_SCRAPERS.map((s) => s.id) // All selected by default
  );
  const [isRunning, setIsRunning] = useState(false);

  const handleScraperToggle = (scraperId: string) => {
    setSelectedScrapers((prev) =>
      prev.includes(scraperId)
        ? prev.filter((id) => id !== scraperId)
        : [...prev, scraperId]
    );
  };

  const handleSelectAll = () => {
    setSelectedScrapers(AVAILABLE_SCRAPERS.map((s) => s.id));
  };

  const handleSelectNone = () => {
    setSelectedScrapers([]);
  };

  const handleScraperDialogOpen = () => {
    setScraperDialogOpen(true);
  };

  const handleScraperDialogClose = () => {
    setScraperDialogOpen(false);
  };

  const handleRunScrapers = async () => {
    if (selectedScrapers.length === 0) {
      return; // Don't run if no scrapers selected
    }

    setIsRunning(true);
    setScraperDialogOpen(false);

    try {
      await AdminService.runScrapers(selectedScrapers);
    } catch (error) {
      console.error("Failed to run scrapers:", error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteConfirmOpen(false);
    await MovieEventService.deleteAll();
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "36px",
        }}
      >
        <div>
          <Typography variant="h5" gutterBottom>
            Run Scrapers
          </Typography>
          <Button
            onClick={handleScraperDialogOpen}
            variant="contained"
            disabled={isRunning}
          >
            {isRunning ? "Running..." : "Select & Run Scrapers"}
          </Button>
        </div>
        <div>
          <Typography variant="h5" gutterBottom>
            Delete All Movie Events and Movie Data
          </Typography>
          <Button onClick={handleDeleteClick} variant="contained" color="error">
            Delete All
          </Button>
        </div>
      </div>

      {/* Scraper Selection Dialog */}
      <Dialog
        open={scraperDialogOpen}
        onClose={handleScraperDialogClose}
        aria-labelledby="scraper-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="scraper-dialog-title">
          Select Scrapers to Run
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Button onClick={handleSelectAll} size="small" sx={{ mr: 1 }}>
              Select All
            </Button>
            <Button onClick={handleSelectNone} size="small">
              Select None
            </Button>
          </Box>

          <FormGroup>
            {AVAILABLE_SCRAPERS.map((scraper) => (
              <FormControlLabel
                key={scraper.id}
                control={
                  <Checkbox
                    checked={selectedScrapers.includes(scraper.id)}
                    onChange={() => handleScraperToggle(scraper.id)}
                  />
                }
                label={scraper.label}
              />
            ))}
          </FormGroup>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            {selectedScrapers.length} of {AVAILABLE_SCRAPERS.length} scrapers
            selected
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleScraperDialogClose} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleRunScrapers}
            variant="contained"
            disabled={selectedScrapers.length === 0}
          >
            Run {selectedScrapers.length} Scraper
            {selectedScrapers.length !== 1 ? "s" : ""}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Confirm Delete All Movie Events and Movie Data
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete ALL data? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            autoFocus
          >
            Delete All Movie Events and Movie Data
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
