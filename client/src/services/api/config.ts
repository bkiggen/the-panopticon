export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:3021/api",
  ENDPOINTS: {
    AUTH: {
      LOGIN: "/auth/login",
      VALIDATE: "/auth/validate",
      CREATE_ADMIN: "/auth/create-admin",
    },
    MOVIE_EVENTS: {
      BASE: "/movie-events",
      BULK: "/movie-events/bulk",
      BY_ID: (id: number) => `/movie-events/${id}`,
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
