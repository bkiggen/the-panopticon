import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Paper,
  CircularProgress,
  Chip,
} from "@mui/material";
import { Upload, CheckCircle, Error } from "@mui/icons-material";
import { MovieEventService } from "@/services/movieEventService";

interface BulkUploadResult {
  success: boolean;
  message: string;
  count?: number;
  error?: string;
}

const BulkMovieEventUpload: React.FC = () => {
  const [jsonInput, setJsonInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<BulkUploadResult | null>(null);
  const [validationError, setValidationError] = useState<string>("");

  const validateJSON = (input: string): boolean => {
    try {
      const parsed = JSON.parse(input);

      if (!Array.isArray(parsed)) {
        setValidationError("Input must be a JSON array");
        return false;
      }

      if (parsed.length === 0) {
        setValidationError("Array cannot be empty");
        return false;
      }

      // Basic validation of required fields
      const requiredFields = [
        "date",
        "title",
        "originalTitle",
        "format",
        "imageUrl",
        "theatre",
      ];
      const firstItem = parsed[0];

      for (const field of requiredFields) {
        if (!(field in firstItem)) {
          setValidationError(`Missing required field: ${field}`);
          return false;
        }
      }

      setValidationError("");
      return true;
    } catch (error) {
      setValidationError("Invalid JSON format");
      return false;
    }
  };

  const handleUpload = async () => {
    if (!jsonInput.trim()) {
      setValidationError("Please enter JSON data");
      return;
    }

    if (!validateJSON(jsonInput)) {
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const data = JSON.parse(jsonInput);
      const response = await MovieEventService.createBulk(data);

      setResult({
        success: true,
        message: response.message,
        count: response.count,
      });

      // Clear the input on successful upload
      setJsonInput("");
    } catch (error: any) {
      setResult({
        success: false,
        message: "Upload failed",
        error: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setJsonInput("");
    setResult(null);
    setValidationError("");
  };

  const exampleData = [
    {
      date: "2025-08-30",
      title: "CAUGHT STEALING",
      originalTitle: "CAUGHT STEALING",
      times: ["2:00pm", "4:30pm", "7:00pm", "9:30pm"],
      format: "Digital",
      imageUrl: "https://example.com/image.jpg",
      ariaLabel: "",
      theatre: "Hollywood Theater",
      accessibility: null,
      discount: null,
    },
  ];

  return (
    <Paper elevation={2} sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Bulk Movie Event Upload
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Paste your JSON array of movie events below to upload multiple events
          at once.
        </Typography>
      </Box>

      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          multiline
          rows={12}
          variant="outlined"
          label="JSON Data"
          placeholder={`Paste your JSON array here...\n\nExample:\n${JSON.stringify(
            exampleData,
            null,
            2
          )}`}
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          error={!!validationError}
          helperText={validationError}
          disabled={isLoading}
        />
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Button
          variant="contained"
          startIcon={isLoading ? <CircularProgress size={20} /> : <Upload />}
          onClick={handleUpload}
          disabled={isLoading || !jsonInput.trim()}
        >
          {isLoading ? "Uploading..." : "Upload Events"}
        </Button>

        <Button variant="outlined" onClick={handleClear} disabled={isLoading}>
          Clear
        </Button>
      </Box>

      {result && (
        <Alert
          severity={result.success ? "success" : "error"}
          icon={result.success ? <CheckCircle /> : <Error />}
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography variant="body1" sx={{ fontWeight: "medium" }}>
              {result.message}
            </Typography>
            {result.success && result.count && (
              <Chip
                label={`${result.count} events created`}
                color="success"
                size="small"
                sx={{ mt: 1 }}
              />
            )}
            {result.error && (
              <Typography variant="body2" sx={{ mt: 1, color: "error.main" }}>
                {result.error}
              </Typography>
            )}
          </Box>
        </Alert>
      )}

      <Box sx={{ mt: 3, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          Required Fields:
        </Typography>
        <Typography variant="body2" color="text.secondary">
          date, title, originalTitle, format, imageUrl, theatre
        </Typography>
        <Typography variant="subtitle2" sx={{ mt: 1 }} gutterBottom>
          Optional Fields:
        </Typography>
        <Typography variant="body2" color="text.secondary">
          times, ariaLabel, accessibility, discount, description, genres,
          imdbId, rottenTomatoesId, trailerUrl
        </Typography>
      </Box>
    </Paper>
  );
};

export default BulkMovieEventUpload;
