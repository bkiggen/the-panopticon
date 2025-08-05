import { useMediaQuery, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Box, Chip, Avatar, Typography } from "@mui/material";
import type { MovieEvent } from "../../models/MovieEvent";

interface TableProps {
  data: MovieEvent[] | null;
}

export const Table = ({ data }: TableProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const rows = data?.map((item, index) => ({
    id: index,
    ...item,
  }));

  // Desktop columns (original)
  const desktopColumns: GridColDef[] = [
    {
      field: "imageUrl",
      headerName: "",
      width: 80,
      sortable: false,
      filterable: false,
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams) => {
        if (params.value.includes("wp-content")) {
          return null;
        }

        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              height: "100%",
            }}
          >
            <Avatar
              src={params.value}
              alt={params.row.title}
              variant="rounded"
              sx={{ height: "80%", margin: "auto" }}
            />
          </Box>
        );
      },
    },
    {
      field: "title",
      headerName: "Movie Title",
      width: 250,
      flex: 2,
      renderCell: (params: GridRenderCellParams) => {
        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              height: "100%",
            }}
          >
            <Typography
              variant="body2"
              sx={{ fontWeight: "medium", textTransform: "capitalize" }}
            >
              {params.value}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: "date",
      headerName: "Date",
      width: 120,
      type: "date",
      valueGetter: (params: any) => {
        return params?.value ? new Date(params.value) : null;
      },
      renderCell: (params: GridRenderCellParams) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Typography variant="body2">
            {new Date(params.row.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </Typography>
        </Box>
      ),
    },
    {
      field: "times",
      headerName: "Showtimes",
      width: 200,
      flex: 2,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            height: "100%",
            gap: 0.5,
          }}
        >
          {params.value.slice(0, 3).map((time: string, index: number) => (
            <Chip
              key={index}
              label={time}
              size="small"
              variant="outlined"
              sx={{ fontSize: "0.75rem" }}
            />
          ))}
          {params.value.length > 3 && (
            <Chip
              label={`+${params.value.length - 3}`}
              size="small"
              variant="outlined"
              color="secondary"
              sx={{ fontSize: "0.75rem" }}
            />
          )}
        </Box>
      ),
    },
    {
      field: "theatre",
      headerName: "Theatre",
      width: 130,
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          size="small"
          color="primary"
          variant="filled"
        />
      ),
    },
    {
      field: "format",
      headerName: "Format",
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          size="small"
          color="info"
          variant="outlined"
        />
      ),
    },
    {
      field: "accessibility",
      headerName: "Accessibility",
      width: 100,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 0.5,
            height: "100%",
          }}
        >
          {params.value?.map((feature: string, index: number) => (
            <Chip
              key={index}
              label={feature}
              size="small"
              color="success"
              variant="outlined"
              sx={{ fontSize: "0.7rem" }}
            />
          )) || "—"}
        </Box>
      ),
    },
  ];

  // Mobile columns (collapsed)
  const mobileColumns: GridColDef[] = [
    {
      field: "movieInfo",
      headerName: "Movie",
      flex: 1,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        const hasValidImage =
          params.row.imageUrl && !params.row.imageUrl.includes("wp-content");

        return (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 1,
              height: "100%",
            }}
          >
            {hasValidImage && (
              <Avatar
                src={params.row.imageUrl}
                alt={params.row.title}
                variant="rounded"
                sx={{ width: 40, height: 40, flexShrink: 0 }}
              />
            )}
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {params.row.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(params.row.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      field: "details",
      headerName: "Details",
      flex: 1,
      sortable: false,
      align: "right",
      renderCell: (params: GridRenderCellParams) => (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-end",
            height: "100%",
            gap: 0.5,
            py: 0.5,
          }}
        >
          {" "}
          <Chip
            label={params.row.theatre}
            size="small"
            color="primary"
            variant="filled"
          />
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 0.25,
            }}
          >
            {params.row.times.slice(0, 2).map((time: string, index: number) => (
              <Chip
                key={index}
                label={time}
                size="small"
                variant="outlined"
                sx={{ fontSize: "0.7rem" }}
              />
            ))}
            {params.row.times.length > 2 && (
              <Chip
                label={`+${params.row.times.length - 2}`}
                size="small"
                variant="outlined"
                color="secondary"
                sx={{ fontSize: "0.7rem" }}
              />
            )}
          </Box>
          <Chip
            label={params.row.format}
            size="small"
            color="info"
            variant="outlined"
          />
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 0.25,
            }}
          >
            {params.row.accessibility?.map((feature: string, index: number) => (
              <Chip
                key={index}
                label={feature}
                size="small"
                color="success"
                variant="outlined"
                sx={{ fontSize: "0.65rem" }}
              />
            ))}
          </Box>
        </Box>
      ),
    },
  ];

  return (
    <Box
      sx={{
        height: "100%",
        maxWidth: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <DataGrid
        rows={rows}
        columns={isMobile ? mobileColumns : desktopColumns}
        initialState={{
          sorting: {
            sortModel: [{ field: "date", sort: "asc" }],
          },
          pagination: {
            paginationModel: { pageSize: 50, page: 0 },
          },
        }}
        sx={{
          "& .MuiDataGrid-columnHeaders": {
            display: isMobile ? "none" : "flex",
          },
        }}
        rowHeight={isMobile ? 160 : 80}
        hideFooter
        checkboxSelection={false}
        disableRowSelectionOnClick
        disableColumnMenu
        disableColumnSorting
        disableVirtualization
      />
    </Box>
  );
};
