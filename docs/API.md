# API Documentation

Base URL: `http://localhost:3021/api` (development) or `/api` (production)

## Authentication

All admin endpoints require JWT authentication via the `Authorization` header:

```
Authorization: Bearer <token>
```

Tokens are obtained via the login endpoint and expire after 24 hours (configurable).

---

## Endpoints

### Authentication

#### `POST /auth/login`

Authenticate admin user and receive JWT token.

**Request Body:**
```json
{
  "email": "admin@panopticon.local",
  "password": "admin123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "email": "admin@panopticon.local",
    "isAdmin": true
  }
}
```

**Status Codes:**
- `200` - Success
- `401` - Invalid credentials
- `400` - Missing fields

---

#### `GET /auth/validate`

Validate current JWT token.

**Headers:** Requires `Authorization: Bearer <token>`

**Response:**
```json
{
  "user": {
    "id": "1",
    "email": "admin@panopticon.local",
    "isAdmin": true
  }
}
```

**Status Codes:**
- `200` - Valid token
- `401` - Invalid/expired token

---

#### `POST /auth/create-admin`

Create a new admin user (requires authentication).

**Headers:** Requires `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "email": "newadmin@example.com",
  "password": "securepassword",
  "name": "New Admin"
}
```

**Status Codes:**
- `201` - Admin created
- `400` - Invalid data or user exists
- `401` - Not authenticated

---

### Movie Events

#### `GET /movie-events`

List all movie events with pagination and filtering.

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 50) - Items per page
- `search` (string) - Search by title
- `theatres` (string) - Comma-separated theater names
- `formats` (string) - Comma-separated formats (e.g., "35mm,70mm")
- `accessibility` (string) - Comma-separated accessibility features
- `startDate` (ISO date) - Filter events from this date
- `endDate` (ISO date) - Filter events until this date
- `timeFilter` (string) - "upcoming", "past", or "all"
- `genres` (string) - Comma-separated genres

**Example:**
```
GET /movie-events?page=1&limit=20&theatres=Cinema 21,Academy Theater&startDate=2024-01-01
```

**Response:**
```json
{
  "events": [
    {
      "id": 1,
      "title": "The Matrix",
      "originalTitle": "The Matrix",
      "date": "2024-01-15",
      "times": ["7:00pm", "9:30pm"],
      "format": "35mm",
      "imageUrl": "https://...",
      "theatre": "Cinema 21",
      "accessibility": ["Open Captions"],
      "description": "A computer hacker learns...",
      "trailerUrl": "https://youtube.com/...",
      "imdbId": "tt0133093",
      "genres": ["Action", "Sci-Fi"],
      "isScraped": true,
      "createdAt": "2024-01-10T12:00:00Z",
      "updatedAt": "2024-01-10T12:00:00Z",
      "movieData": {
        "id": 1,
        "title": "The Matrix",
        "description": "...",
        "genres": ["Action", "Sci-Fi"],
        "imdbId": "tt0133093"
      }
    }
  ],
  "total": 150,
  "totalPages": 8
}
```

---

#### `GET /movie-events/:id`

Get a single movie event by ID.

**Response:**
```json
{
  "id": 1,
  "title": "The Matrix",
  "originalTitle": "The Matrix",
  "date": "2024-01-15",
  "times": ["7:00pm", "9:30pm"],
  "format": "35mm",
  "theatre": "Cinema 21",
  "movieData": { ... }
}
```

**Status Codes:**
- `200` - Success
- `404` - Event not found

---

#### `POST /movie-events`

Create a new movie event (admin only).

**Headers:** Requires `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "The Matrix",
  "originalTitle": "The Matrix",
  "date": "2024-01-15",
  "times": ["7:00pm", "9:30pm"],
  "format": "35mm",
  "theatre": "Cinema 21",
  "imageUrl": "https://...",
  "accessibility": ["Open Captions"],
  "description": "Optional description",
  "trailerUrl": "https://...",
  "imdbId": "tt0133093",
  "genres": ["Action", "Sci-Fi"]
}
```

**Response:**
```json
{
  "id": 1,
  "title": "The Matrix",
  ...
}
```

**Status Codes:**
- `201` - Created
- `400` - Invalid data
- `401` - Not authenticated

---

#### `PUT /movie-events/:id`

Update an existing movie event (admin only).

**Headers:** Requires `Authorization: Bearer <token>`

**Request Body:** Same as POST (all fields optional for update)

**Status Codes:**
- `200` - Updated
- `400` - Invalid data
- `401` - Not authenticated
- `404` - Event not found

---

#### `DELETE /movie-events/:id`

Delete a movie event (admin only).

**Headers:** Requires `Authorization: Bearer <token>`

**Status Codes:**
- `204` - Deleted
- `401` - Not authenticated
- `404` - Event not found

---

#### `POST /movie-events/bulk`

Bulk create movie events from JSON (admin only).

**Headers:** Requires `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "events": [
    {
      "title": "Movie 1",
      "date": "2024-01-15",
      "times": ["7:00pm"],
      "format": "Digital",
      "theatre": "Cinema 21"
    },
    {
      "title": "Movie 2",
      ...
    }
  ]
}
```

**Response:**
```json
{
  "message": "Created 25 events",
  "count": 25
}
```

**Status Codes:**
- `201` - Created
- `400` - Invalid data
- `401` - Not authenticated

---

#### `POST /movie-events/delete-all`

Delete all movie events (admin only, use with caution).

**Headers:** Requires `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "Deleted 150 events",
  "count": 150
}
```

**Status Codes:**
- `200` - Deleted
- `401` - Not authenticated

---

### Movie Data (Admin Only)

All movie data endpoints require authentication.

#### `GET /admin/movie-data`

List movie metadata with pagination and filtering.

**Headers:** Requires `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 50)
- `search` (string) - Search by title
- `genres` (string) - Comma-separated genres
- `hasImdbId` (boolean) - Filter by presence of IMDb ID
- `hasRottenTomatoesId` (boolean) - Filter by presence of RT ID

**Response:**
```json
{
  "movieData": [
    {
      "id": 1,
      "title": "The Matrix",
      "originalTitle": "The Matrix",
      "description": "A computer hacker...",
      "imageUrl": "https://...",
      "trailerUrl": "https://...",
      "omdbId": "tt0133093",
      "imdbId": "tt0133093",
      "rottenTomatoesId": "1077027",
      "genres": ["Action", "Sci-Fi"],
      "createdAt": "2024-01-10T12:00:00Z",
      "updatedAt": "2024-01-10T12:00:00Z",
      "movieEvents": [ ... ]
    }
  ],
  "total": 100,
  "totalPages": 2
}
```

---

#### `GET /admin/movie-data/:id`

Get a single movie data entry by ID.

**Headers:** Requires `Authorization: Bearer <token>`

**Status Codes:**
- `200` - Success
- `401` - Not authenticated
- `404` - Not found

---

#### `POST /admin/movie-data`

Create new movie metadata.

**Headers:** Requires `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "The Matrix",
  "originalTitle": "The Matrix",
  "description": "A computer hacker...",
  "imageUrl": "https://...",
  "trailerUrl": "https://...",
  "imdbId": "tt0133093",
  "genres": ["Action", "Sci-Fi"]
}
```

**Status Codes:**
- `201` - Created
- `400` - Invalid data
- `401` - Not authenticated

---

#### `PUT /admin/movie-data/:id`

Update movie metadata.

**Headers:** Requires `Authorization: Bearer <token>`

**Request Body:** Same as POST (fields optional)

**Status Codes:**
- `200` - Updated
- `400` - Invalid data
- `401` - Not authenticated
- `404` - Not found

---

#### `DELETE /admin/movie-data/:id`

Delete movie metadata.

**Headers:** Requires `Authorization: Bearer <token>`

**Status Codes:**
- `204` - Deleted
- `401` - Not authenticated
- `404` - Not found

---

#### `POST /admin/movie-data/bulk-delete`

Bulk delete movie data entries.

**Headers:** Requires `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "ids": [1, 2, 3, 4, 5]
}
```

**Response:**
```json
{
  "message": "Deleted 5 entries",
  "count": 5
}
```

**Status Codes:**
- `200` - Deleted
- `400` - Invalid data
- `401` - Not authenticated

---

### Admin Actions

#### `POST /admin/run-scrapers`

Trigger scrapers to fetch new events (admin only).

**Headers:** Requires `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "scrapers": ["cinema21", "academy", "omdb"]
}
```

**Available Scrapers:**
- `cinema21` - Cinema 21 website
- `academy` - Academy Theater website
- `laurelhurst` - Laurelhurst Theater website
- `tomorrow` - Tomorrow Theater website
- `stJohns` - St. Johns Cinema website
- `clinton` - Clinton Street Theater website
- `cinemagic` - Cinemagic website (marked as unreliable)
- `livingRoom` - Living Room Theaters website
- `omdb` - OMDB API for enriching metadata

**Response:**
```json
{
  "message": "Scrapers started",
  "scrapers": ["cinema21", "academy"]
}
```

**Status Codes:**
- `200` - Scrapers started
- `400` - Invalid scraper names
- `401` - Not authenticated

---

## Data Models

### MovieEvent

```typescript
{
  id: number
  title: string
  originalTitle: string
  date: string (ISO date)
  times: string[] (e.g., ["2:00pm", "7:00pm"])
  format: "Digital" | "16mm" | "35mm" | "70mm" | "VHS"
  imageUrl: string
  theatre: string
  accessibility: string[] (e.g., ["Open Captions", "Audio Description"])
  description?: string
  trailerUrl?: string
  imdbId?: string
  genres?: string[]
  movieData?: MovieData (relationship)
  createdAt: string (ISO timestamp)
  updatedAt: string (ISO timestamp)
  isScraped: boolean
}
```

### MovieData

```typescript
{
  id: number
  title: string
  originalTitle: string
  description?: string
  imageUrl?: string
  trailerUrl?: string
  omdbId?: string
  imdbId?: string
  rottenTomatoesId?: string
  genres: string[]
  movieEvents?: MovieEvent[] (relationship)
  createdAt: string
  updatedAt: string
}
```

### User

```typescript
{
  id: string
  email: string
  isAdmin: boolean
}
```

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "error": "Error message describing what went wrong"
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `204` - No Content (successful deletion)
- `400` - Bad Request (invalid data)
- `401` - Unauthorized (not authenticated or invalid token)
- `403` - Forbidden (not authorized for this action)
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

Currently no rate limiting is implemented. Consider adding in production.

## CORS

CORS is enabled for all origins in development. Configure for production use.

## Notes

1. All date fields use ISO 8601 format
2. Times are stored as strings (e.g., "7:00pm") - no timezone handling
3. Pagination uses offset-based approach (consider cursor-based for scale)
4. No caching headers currently set
5. File uploads not currently supported
6. WebSocket/real-time updates not implemented
