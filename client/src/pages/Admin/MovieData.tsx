// src/pages/admin/MovieDataPage.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Chip,
  Stack,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridRowParams,
  GridToolbar,
} from "@mui/x-data-grid";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  DeleteSweep as BulkDeleteIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import useMovieDataStore, { MovieDataProps } from "@/stores/movieDataStore";

const MovieDataPage: React.FC = () => {
  const {
    movieData,
    loading,
    submitting,
    error,
    filters,
    currentPage,
    pageSize,
    totalMovieData,
    selectedIds,
    allGenres,
    fetchMovieData,
    deleteMovieData,
    bulkDeleteMovieData,
    setFilters,
    goToPage,
    changePageSize,
    // setSelectedIds,
    // clearSelection,
    clearError,
    refreshMovieData,
  } = useMovieDataStore();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<MovieDataProps | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  // Local filter state
  const [localFilters, setLocalFilters] = useState({
    search: filters.search || "",
    genres: filters.genres || [],
    hasImdbId: filters.hasImdbId,
    hasRottenTomatoesId: filters.hasRottenTomatoesId,
  });

  useEffect(() => {
    fetchMovieData();
  }, [fetchMovieData]);

  const handleApplyFilters = useCallback(() => {
    const cleanFilters = {
      ...localFilters,
      search: localFilters.search.trim() || undefined,
      genres: localFilters.genres.length > 0 ? localFilters.genres : undefined,
    };
    setFilters(cleanFilters);
    fetchMovieData(cleanFilters, 1);
  }, [localFilters, setFilters, fetchMovieData]);

  const handleClearFilters = useCallback(() => {
    const emptyFilters = {
      search: "",
      genres: [],
      hasImdbId: undefined,
      hasRottenTomatoesId: undefined,
    };
    setLocalFilters(emptyFilters);
    setFilters({});
    fetchMovieData({}, 1);
  }, [setFilters, fetchMovieData]);

  const handleDeleteClick = (movieData: MovieDataProps) => {
    setItemToDelete(movieData);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      try {
        await deleteMovieData(itemToDelete.id);
        setDeleteDialogOpen(false);
        setItemToDelete(null);
      } catch (error) {
        console.error("Delete failed:", error);
      }
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length > 0) {
      setBulkDeleteDialogOpen(true);
    }
  };

  const handleBulkDeleteConfirm = async () => {
    try {
      await bulkDeleteMovieData(selectedIds);
      setBulkDeleteDialogOpen(false);
    } catch (error) {
      console.error("Bulk delete failed:", error);
    }
  };

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "ID",
      width: 80,
    },
    {
      field: "title",
      headerName: "Title",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "originalTitle",
      headerName: "Original Title",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "genres",
      headerName: "Genres",
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
          {params.value?.slice(0, 2).map((genre: string, index: number) => (
            <Chip key={index} label={genre} size="small" variant="outlined" />
          ))}
          {params.value?.length > 2 && (
            <Chip
              label={`+${params.value.length - 2}`}
              size="small"
              variant="outlined"
            />
          )}
        </Box>
      ),
    },
    {
      field: "imdbId",
      headerName: "IMDB ID",
      width: 120,
      renderCell: (params) =>
        params.value ? (
          <Chip label="IMDB" size="small" color="primary" variant="outlined" />
        ) : (
          <Chip
            label="No IMDB"
            size="small"
            color="default"
            variant="outlined"
          />
        ),
    },
    {
      field: "rottenTomatoesId",
      headerName: "RT ID",
      width: 100,
      renderCell: (params) =>
        params.value ? (
          <Chip label="RT" size="small" color="secondary" variant="outlined" />
        ) : (
          <Chip label="No RT" size="small" color="default" variant="outlined" />
        ),
    },
    {
      field: "movieEvents",
      headerName: "Events Count",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value?.length || 0}
          size="small"
          color={params.value?.length > 0 ? "success" : "default"}
        />
      ),
    },
    {
      field: "createdAt",
      headerName: "Created",
      width: 150,
      renderCell: (params) => new Date(params.value).toLocaleDateString(),
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 120,
      getActions: (params: GridRowParams) => [
        <GridActionsCellItem
          icon={<ViewIcon />}
          label="View"
          onClick={() => {
            // Navigate to view page
            console.log("View:", params.row);
          }}
        />,
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => {
            // Navigate to edit page
            console.log("Edit:", params.row);
          }}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDeleteClick(params.row)}
        />,
      ],
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Box
          sx={{
            mb: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h4" component="h1">
            Movie Data Management
          </Typography>
          <Stack direction="row" spacing={2}>
            <Tooltip title="Refresh Data">
              <IconButton onClick={refreshMovieData} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            {selectedIds.length > 0 && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<BulkDeleteIcon />}
                onClick={handleBulkDelete}
                disabled={submitting}
              >
                Delete Selected ({selectedIds.length})
              </Button>
            )}
          </Stack>
        </Box>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Filters
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="Search"
              placeholder="Search by title or description..."
              value={localFilters.search}
              onChange={(e) =>
                setLocalFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              fullWidth
            />

            <Stack direction="row" spacing={2}>
              <Autocomplete
                multiple
                options={allGenres}
                value={localFilters.genres}
                onChange={(_, newValue) =>
                  setLocalFilters((prev) => ({ ...prev, genres: newValue }))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Genres"
                    placeholder="Select genres"
                  />
                )}
                sx={{ minWidth: 300 }}
              />

              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Has IMDB ID</InputLabel>
                <Select
                  value={localFilters.hasImdbId ?? ""}
                  onChange={(e) =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      hasImdbId:
                        e.target.value === ""
                          ? undefined
                          : e.target.value === "true",
                    }))
                  }
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="true">Yes</MenuItem>
                  <MenuItem value="false">No</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Has RT ID</InputLabel>
                <Select
                  value={localFilters.hasRottenTomatoesId ?? ""}
                  onChange={(e) =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      hasRottenTomatoesId:
                        e.target.value === ""
                          ? undefined
                          : e.target.value === "true",
                    }))
                  }
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="true">Yes</MenuItem>
                  <MenuItem value="false">No</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <Stack direction="row" spacing={2}>
              <Button variant="contained" onClick={handleApplyFilters}>
                Apply Filters
              </Button>
              <Button variant="outlined" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
            {error}
          </Alert>
        )}

        {/* Data Grid */}
        <Box sx={{ height: 600 }}>
          <DataGrid
            rows={movieData}
            columns={columns}
            loading={loading}
            pagination
            paginationMode="server"
            page={currentPage - 1} // DataGrid uses 0-based indexing
            pageSize={pageSize}
            rowCount={totalMovieData}
            onPageChange={(newPage: any) => goToPage(newPage + 1)}
            onPageSizeChange={(newPageSize: any) => changePageSize(newPageSize)}
            pageSizeOptions={[10, 25, 50, 100]}
            checkboxSelection
            // rowSelectionModel={selectedIds}
            // onRowSelectionModelChange={(
            //   newSelection: GridRowSelectionModel
            // ) => {
            //   setSelectedIds(newSelection as number[]);
            // }}
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 },
              },
            }}
            disableRowSelectionOnClick
          />
        </Box>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete "{itemToDelete?.title}"? This action
          cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            disabled={submitting}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog
        open={bulkDeleteDialogOpen}
        onClose={() => setBulkDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Bulk Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete {selectedIds.length} selected movie
          data entries? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleBulkDeleteConfirm}
            color="error"
            disabled={submitting}
          >
            Delete Selected
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MovieDataPage;
