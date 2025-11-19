import React, { useEffect, useState, useRef } from "react";
import { Box, Paper, Typography, IconButton, Chip } from "@mui/material";
import { Clear as ClearIcon } from "@mui/icons-material";
import { API_CONFIG } from "@/services/api/config";

interface LogMessage {
  timestamp: string;
  message: string;
  type: "log" | "error" | "warn" | "info";
}

export const LogViewer: React.FC = () => {
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs arrive
  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  useEffect(() => {
    // Connect to SSE endpoint
    const connectToLogStream = () => {
      const eventSource = new EventSource(
        `${API_CONFIG.BASE_URL}/admin/logs`,
        {
          withCredentials: false,
        }
      );

      eventSource.onopen = () => {
        console.log("Connected to log stream");
        setIsConnected(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const logMessage: LogMessage = JSON.parse(event.data);
          setLogs((prevLogs) => [...prevLogs, logMessage]);
        } catch (error) {
          console.error("Failed to parse log message:", error);
        }
      };

      eventSource.onerror = () => {
        console.error("Log stream connection error");
        setIsConnected(false);
        eventSource.close();

        // Attempt to reconnect after 3 seconds
        setTimeout(connectToLogStream, 3000);
      };

      eventSourceRef.current = eventSource;
    };

    connectToLogStream();

    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const handleClearLogs = () => {
    setLogs([]);
  };

  const getLogColor = (type: LogMessage["type"]) => {
    switch (type) {
      case "error":
        return "#ff5252";
      case "warn":
        return "#ffa726";
      case "info":
        return "#42a5f5";
      default:
        return "#e0e0e0";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        height: "400px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="h6">Scraper Console</Typography>
          <Chip
            label={isConnected ? "Connected" : "Disconnected"}
            color={isConnected ? "success" : "default"}
            size="small"
          />
        </Box>
        <IconButton
          onClick={handleClearLogs}
          size="small"
          title="Clear logs"
          disabled={logs.length === 0}
        >
          <ClearIcon />
        </IconButton>
      </Box>

      {/* Logs Container */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          bgcolor: "#1e1e1e",
          borderRadius: 1,
          p: 1.5,
          fontFamily: "monospace",
          fontSize: "13px",
        }}
      >
        {logs.length === 0 ? (
          <Typography
            variant="body2"
            sx={{ color: "#666", fontStyle: "italic" }}
          >
            Waiting for logs...
          </Typography>
        ) : (
          logs.map((log, index) => (
            <Box
              key={index}
              sx={{
                mb: 0.5,
                display: "flex",
                gap: 1,
                color: getLogColor(log.type),
              }}
            >
              <Typography
                component="span"
                sx={{
                  fontFamily: "monospace",
                  fontSize: "12px",
                  color: "#888",
                  minWidth: "70px",
                }}
              >
                {formatTimestamp(log.timestamp)}
              </Typography>
              <Typography
                component="span"
                sx={{
                  fontFamily: "monospace",
                  fontSize: "13px",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {log.message}
              </Typography>
            </Box>
          ))
        )}
        <div ref={logsEndRef} />
      </Box>
    </Paper>
  );
};
