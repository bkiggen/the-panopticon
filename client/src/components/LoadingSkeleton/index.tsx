import { Skeleton, Card, CardContent, Box } from "@mui/material";

/**
 * Loading skeleton for movie event cards
 * Provides a better UX while data is loading
 */
export const MovieEventSkeleton = () => {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        {/* Image skeleton */}
        <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />

        {/* Title skeleton */}
        <Skeleton variant="text" height={32} width="80%" sx={{ mb: 1 }} />

        {/* Theater and date */}
        <Skeleton variant="text" height={24} width="60%" sx={{ mb: 1 }} />

        {/* Times */}
        <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
          <Skeleton variant="rectangular" width={80} height={32} />
          <Skeleton variant="rectangular" width={80} height={32} />
          <Skeleton variant="rectangular" width={80} height={32} />
        </Box>

        {/* Description */}
        <Skeleton variant="text" height={20} width="100%" />
        <Skeleton variant="text" height={20} width="90%" />
        <Skeleton variant="text" height={20} width="70%" />
      </CardContent>
    </Card>
  );
};

/**
 * Multiple loading skeletons
 */
export const MovieEventSkeletonList = ({ count = 6 }: { count?: number }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <MovieEventSkeleton key={index} />
      ))}
    </>
  );
};

/**
 * Simple grid loading skeleton for data grids
 */
export const DataGridSkeleton = () => {
  return (
    <Box sx={{ p: 2 }}>
      {/* Header row */}
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <Skeleton variant="rectangular" height={40} sx={{ flex: 1 }} />
        <Skeleton variant="rectangular" height={40} sx={{ flex: 1 }} />
        <Skeleton variant="rectangular" height={40} sx={{ flex: 1 }} />
        <Skeleton variant="rectangular" height={40} sx={{ flex: 0.5 }} />
      </Box>

      {/* Data rows */}
      {Array.from({ length: 10 }).map((_, index) => (
        <Box key={index} sx={{ display: "flex", gap: 2, mb: 1 }}>
          <Skeleton variant="text" height={48} sx={{ flex: 1 }} />
          <Skeleton variant="text" height={48} sx={{ flex: 1 }} />
          <Skeleton variant="text" height={48} sx={{ flex: 1 }} />
          <Skeleton variant="text" height={48} sx={{ flex: 0.5 }} />
        </Box>
      ))}
    </Box>
  );
};
