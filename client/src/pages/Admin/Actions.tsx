import {
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { useState } from "react";
import { AdminService } from "@/services/adminService";
import { MovieEventService } from "@/services/movieEventService"; // Import the service

export const Actions = () => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const handleScrape = async () => {
    await AdminService.runScrapers();
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
            Trigger All Scrapers
          </Typography>
          <Button onClick={handleScrape} variant="contained">
            Go
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
