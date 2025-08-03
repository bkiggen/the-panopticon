import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Box, Chip, Avatar, Typography } from "@mui/material";
import type { MovieEvent } from "../../models/MovieEvent";

interface TableProps {
  data: MovieEvent[] | null;
}

export const Table = ({ data }: TableProps) => {
  const rows = data?.map((item, index) => ({
    id: index,
    ...item,
  }));

  const columns: GridColDef[] = [
    {
      field: "imageUrl",
      headerName: "",
      width: 80,
      sortable: false,
      filterable: false,
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams) => {
        console.log(params.value);
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
            <Typography variant="body2" sx={{ fontWeight: "medium" }}>
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
        columns={columns}
        initialState={{
          sorting: {
            sortModel: [{ field: "date", sort: "asc" }],
          },
          pagination: {
            paginationModel: { pageSize: 50, page: 0 },
          },
        }}
        rowHeight={80}
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
