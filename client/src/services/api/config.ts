export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:3021/api",
  ENDPOINTS: {
    AUTH: {
      MAGIC_LINK: "/auth/magic-link",
      MAGIC_LINK_VERIFY: "/auth/magic-link/verify",
      VALIDATE: "/auth/validate",
    },
    MOVIE_EVENTS: {
      BASE: "/movie-events",
      BULK: "/movie-events/bulk",
      DELETE_ALL: "/movie-events/delete-all",
      BY_ID: (id: number) => `/movie-events/${id}`,
    },
    MOVIE_DATA: {
      BASE: "/admin/movie-data",
      BY_ID: (id: number) => `/admin/movie-data/${id}`,
      BULK_DELETE: "/admin/movie-data/bulk-delete",
    },
  },
  STORAGE_KEYS: {
    AUTH_TOKEN: "admin_token",
    SESSION: "session-storage",
  },
  AUTH: {
    TOKEN_HEADER: "Authorization",
    TOKEN_PREFIX: "Bearer",
  },
} as const;
