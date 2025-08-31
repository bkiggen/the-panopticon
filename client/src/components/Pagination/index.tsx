import React from "react";
import { Box, Button, IconButton, Typography, Chip } from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  FirstPage,
  LastPage,
} from "@mui/icons-material";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
  pageSizeOptions?: number[];
  showFirstLast?: boolean;
  leftContent?: React.ReactNode;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  loading = false,
  showFirstLast = false,
  leftContent,
}) => {
  // Calculate displayed items range
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers to show
  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7; // Maximum number of page buttons to show

    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show subset with ellipsis
      if (currentPage <= 4) {
        // Near beginning
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // Near end
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // In middle
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 2,
        py: 2,
        px: 2,
        borderRadius: 1,
        backgroundColor: "background.paper",
      }}
    >
      <Box>{leftContent}</Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <Chip
          label={`${startItem.toLocaleString()}-${endItem.toLocaleString()} of ${totalItems.toLocaleString()}`}
          size="small"
          variant="outlined"
        />
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* First page button */}
          {showFirstLast && (
            <IconButton
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1 || loading}
              size="small"
              title="First page"
            >
              <FirstPage />
            </IconButton>
          )}

          {/* Previous page button */}
          <IconButton
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            size="small"
            title="Previous page"
          >
            <ChevronLeft />
          </IconButton>

          {/* Page number buttons */}
          <Box sx={{ display: "flex", gap: 0.5 }}>
            {visiblePages.map((page, index) => (
              <React.Fragment key={index}>
                {page === "..." ? (
                  <Typography
                    variant="body2"
                    sx={{ px: 1, py: 0.5, color: "text.secondary" }}
                  >
                    ...
                  </Typography>
                ) : (
                  <Button
                    variant={currentPage === page ? "contained" : "outlined"}
                    size="small"
                    onClick={() => onPageChange(page as number)}
                    disabled={loading}
                    sx={{
                      minWidth: 36,
                      height: 36,
                      fontSize: "0.875rem",
                    }}
                  >
                    {page}
                  </Button>
                )}
              </React.Fragment>
            ))}
          </Box>

          {/* Next page button */}
          <IconButton
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
            size="small"
            title="Next page"
          >
            <ChevronRight />
          </IconButton>

          {/* Last page button */}
          {showFirstLast && (
            <IconButton
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages || loading}
              size="small"
              title="Last page"
            >
              <LastPage />
            </IconButton>
          )}
        </Box>
      </Box>
    </Box>
  );
};
