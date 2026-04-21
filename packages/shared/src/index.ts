// Shared types for Dr. Movie Times M.D.
// These types mirror the Prisma schema but are decoupled for client use

export interface MovieEvent {
  id: number;
  date: Date | string;
  title: string;
  originalTitle: string;
  times: string[];
  format: string;
  imageUrl: string;
  genres: string[];
  description: string | null;
  trailerUrl: string | null;
  imdbId: string | null;
  rottenTomatoesId: string | null;
  theatre: string;
  accessibility: string[];
  discount: string[];
  pendingApprovalAt: Date | string | null;
  approvedAt: Date | string | null;
  scrapedAt: Date | string | null;
  movieDataId: number | null;
  movieData?: MovieData | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface MovieData {
  id: number;
  title: string;
  originalTitle: string;
  description: string | null;
  imageUrl: string | null;
  trailerUrl: string | null;
  omdbId: string | null;
  imdbId: string | null;
  rottenTomatoesId: string | null;
  genres: string[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface User {
  id: number;
  email: string;
  name: string | null;
  isAdmin: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// API Response types
export interface PaginatedResponse<T> {
  events: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface MovieEventFilters {
  search?: string;
  theatres?: string[];
  formats?: string[];
  genres?: string[];
  accessibility?: string[];
  startDate?: string;
  endDate?: string;
  timeFilter?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
    isAdmin: boolean;
  };
}

export interface ApiError {
  error: string;
  details?: unknown;
}
