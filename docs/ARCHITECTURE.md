# Architecture Documentation

## Overview

Panopticon is a full-stack web application built with a modern React frontend and Node.js backend, designed to aggregate and display movie theater events for Portland's independent cinema scene.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   React UI   │◄─┤ Zustand Store│◄─┤ API Services │      │
│  │ Components   │  │  (State Mgmt) │  │   (Fetch)    │      │
│  └──────────────┘  └──────────────┘  └──────┬───────┘      │
│         │                                     │               │
└─────────┼─────────────────────────────────────┼──────────────┘
          │                                     │
          │                                     │ HTTP/REST
          │                                     │
┌─────────┼─────────────────────────────────────┼──────────────┐
│         │                                     ▼               │
│         │                            ┌──────────────┐        │
│         │                            │  Express API │        │
│         │                            │   Routes     │        │
│         │                            └──────┬───────┘        │
│         │                                   │                │
│         │                            ┌──────▼───────┐        │
│         │                            │ Controllers  │        │
│         │                            │   & Auth     │        │
│         │                            └──────┬───────┘        │
│         │                                   │                │
│  ┌──────▼───────┐                   ┌──────▼───────┐        │
│  │ Static Files │                   │   Services   │        │
│  │  (Production)│                   │   & Logic    │        │
│  └──────────────┘                   └──────┬───────┘        │
│                                             │                │
│                                      ┌──────▼───────┐        │
│                                      │ Prisma ORM   │        │
│                                      └──────┬───────┘        │
│                         Backend             │                │
└─────────────────────────────────────────────┼────────────────┘
                                              │
                  ┌───────────────────────────┼───────────────┐
                  │                           ▼               │
                  │                  ┌──────────────┐         │
                  │                  │  PostgreSQL  │         │
                  │                  │   Database   │         │
                  │                  └──────────────┘         │
                  │                                           │
                  └───────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                     External Services                         │
│  ┌──────────────┐           ┌──────────────┐                 │
│  │  OMDB API    │           │  Theater     │                 │
│  │  (Metadata)  │           │  Websites    │                 │
│  └──────▲───────┘           └──────▲───────┘                 │
│         │                          │                          │
│         └──────────────┬───────────┘                          │
│                        │                                      │
│                 ┌──────▼───────┐                              │
│                 │   Scrapers   │                              │
│                 │ (Cron Jobs)  │                              │
│                 └──────────────┘                              │
└──────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Technology Stack

- **React 19** - UI framework with concurrent features
- **TypeScript** - Type safety and developer experience
- **Vite** - Fast build tool with HMR
- **Material-UI v7** - Component library with theming
- **Zustand** - Lightweight state management
- **React Router v7** - Client-side routing
- **React Hook Form + Yup** - Form handling and validation

### Directory Structure

```
client/src/
├── components/           # Reusable UI components
│   ├── Header/          # App header with navigation
│   ├── MovieEventCard/  # Event display cards
│   ├── Filters/         # Filter controls
│   └── ...
├── pages/               # Route-level components
│   ├── MovieEvents/     # Public event listing
│   ├── Admin/           # Admin dashboard
│   └── Auth/            # Login page
├── services/            # API client layer
│   ├── api/
│   │   └── config.ts    # API configuration
│   ├── movieEventService.ts
│   ├── movieDataService.ts
│   └── authService.ts
├── stores/              # Zustand state stores
│   ├── sessionStore.ts  # Auth state
│   ├── movieEventStore.ts
│   └── movieDataStore.ts
├── lib/                 # Constants and configuration
│   ├── theatres.ts      # Theater list
│   ├── genres.ts        # Genre constants
│   └── formats.ts       # Format types
├── utils/               # Utility functions
├── hooks/               # Custom React hooks
├── routing/             # Route definitions
└── types/               # TypeScript type definitions
```

### State Management

Panopticon uses **Zustand** for state management, providing a simple, hook-based API without boilerplate.

#### Store Pattern

```typescript
// Example: movieEventStore.ts
const useMovieEventStore = create<MovieEventStore>((set, get) => ({
  // State
  events: [],
  loading: false,
  error: null,

  // Computed getters
  theatres: () => [...new Set(get().events.map(e => e.theatre))],

  // Actions (sync)
  setEvents: (events) => set({ events }),

  // Thunks (async)
  fetchEvents: async (filters) => {
    set({ loading: true, error: null })
    try {
      const data = await movieEventService.getMovieEvents(filters)
      set({ events: data.events, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  }
}))
```

#### Active Stores

1. **sessionStore** - Authentication state (persisted to localStorage)
2. **movieEventStore** - Public event listing with filters and pagination
3. **movieDataStore** - Admin movie metadata management

### Routing

Uses React Router v7 with data loading patterns:

```
/ (Public)
  └─ MovieEvents page

/auth (Public)
  └─ Login page

/admin (Protected)
  └─ Admin dashboard
      ├─ Event management
      └─ Movie data management
```

**Route Protection:**
- `PublicLayout` - Wraps public routes
- `AdminLayout` - Wraps admin routes, redirects if not authenticated

### API Layer

All API calls go through service modules that use a configured fetch wrapper:

**Pattern:**
```typescript
// services/movieEventService.ts
export const movieEventService = {
  getMovieEvents: async (filters) => {
    const params = buildQueryParams(filters)
    return authenticatedFetch(`${API_BASE}/movie-events?${params}`)
  },

  createEvent: async (data) => {
    return authenticatedFetch(`${API_BASE}/movie-events`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }
}
```

**Benefits:**
- Centralized error handling
- Automatic auth header injection
- Type-safe responses
- Easy to mock for testing

### Component Architecture

**Component Hierarchy:**
```
App
├── PublicLayout
│   └── MovieEvents (page)
│       ├── Header
│       ├── Filters
│       │   ├── DateRangePicker
│       │   ├── TheatreSelect
│       │   └── FormatSelect
│       ├── MovieEventCard (repeated)
│       └── Pagination
└── AdminLayout (protected)
    └── Admin (page)
        ├── Header
        ├── Tabs
        ├── EventDataGrid
        ├── MovieDataGrid
        └── Modals
            ├── CreateEventModal
            └── UploadJSONModal
```

**Design Patterns:**
- **Container/Presentational** - Pages fetch data, components display it
- **Composition** - Complex components built from smaller pieces
- **Controlled Components** - Form inputs controlled by React Hook Form
- **Custom Hooks** - Reusable logic (useDebounce, useAuth, etc.)

### Form Handling

**Stack:** React Hook Form + Yup

**Pattern:**
```typescript
// Define schema
const schema = yup.object().shape({
  title: yup.string().required("Title is required"),
  date: yup.date().required("Date is required"),
  times: yup.array().of(yup.object({ value: yup.string() }))
})

// Use in component
const { control, handleSubmit, formState: { errors } } = useForm({
  resolver: yupResolver(schema),
  defaultValues: { ... }
})

// Field arrays for dynamic lists
const { fields, append, remove } = useFieldArray({
  control,
  name: "times"
})
```

**Benefits:**
- Performant (no full-form re-renders)
- Type-safe with TypeScript
- Declarative validation
- Easy integration with Material-UI

### Theming

Material-UI's theming system provides:
- Dark/light mode toggle
- Consistent colors, spacing, typography
- Responsive breakpoints
- CSS-in-JS with Emotion

**Theme Structure:**
```typescript
const theme = createTheme({
  palette: {
    mode: 'dark', // or 'light'
    primary: { ... },
    secondary: { ... }
  },
  typography: { ... },
  components: {
    MuiButton: { ... }, // Component overrides
  }
})
```

---

## Backend Architecture

### Technology Stack

- **Node.js + Express** - Web server
- **TypeScript** - Type safety
- **Prisma** - Database ORM
- **PostgreSQL** - Relational database
- **JWT** - Authentication
- **Puppeteer** - Web scraping
- **node-cron** - Scheduled jobs

### Directory Structure (Inferred)

```
server/src/
├── routes/              # Express route definitions
│   ├── movieEvents.ts
│   ├── admin.ts
│   └── authRoutes.ts
├── controllers/         # Request handlers
│   └── authController.ts
├── services/            # Business logic
│   ├── cronService.ts
│   └── omdbService.ts
├── middleware/          # Express middleware
│   └── auth.ts         # JWT verification
├── cron/                # Scrapers and scheduled jobs
│   └── scrapers/
│       ├── cinema21.ts
│       ├── academy.ts
│       ├── laurelhurst.ts
│       ├── tomorrow.ts
│       ├── stJohns.ts
│       ├── clinton.ts
│       ├── cinemagic.ts
│       └── livingRoom.ts
├── types/               # TypeScript types
├── paths.ts             # Path aliases setup
└── app.ts               # Main application entry
```

### Database Schema

**Prisma Schema** (prisma/schema.prisma):

```prisma
model User {
  id             String   @id @default(uuid())
  email          String   @unique
  hashedPassword String
  name           String
  isAdmin        Boolean  @default(false)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model MovieEvent {
  id            Int        @id @default(autoincrement())
  title         String
  originalTitle String
  date          DateTime
  times         String[]
  format        String
  imageUrl      String?
  theatre       String
  accessibility String[]
  description   String?
  trailerUrl    String?
  imdbId        String?
  genres        String[]
  isScraped     Boolean    @default(false)
  movieData     MovieData? @relation(fields: [movieDataId], references: [id])
  movieDataId   Int?
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  @@index([date])
  @@index([theatre])
  @@index([movieDataId])
}

model MovieData {
  id                 Int          @id @default(autoincrement())
  title              String
  originalTitle      String
  description        String?
  imageUrl           String?
  trailerUrl         String?
  omdbId             String?      @unique
  imdbId             String?      @unique
  rottenTomatoesId   String?      @unique
  genres             String[]
  movieEvents        MovieEvent[]
  createdAt          DateTime     @default(now())
  updatedAt          DateTime     @updatedAt

  @@index([imdbId])
}
```

**Relationships:**
- One MovieData → Many MovieEvents (one movie can have multiple showtimes)
- MovieEvent optionally linked to MovieData for enriched metadata

### Authentication Flow

```
┌─────────┐                    ┌─────────┐                ┌──────────┐
│ Client  │                    │  API    │                │ Database │
└────┬────┘                    └────┬────┘                └────┬─────┘
     │                              │                          │
     │ POST /auth/login             │                          │
     │ {email, password}            │                          │
     │─────────────────────────────►│                          │
     │                              │                          │
     │                              │ Query user by email      │
     │                              │─────────────────────────►│
     │                              │                          │
     │                              │ ◄────────────────────────│
     │                              │ User record              │
     │                              │                          │
     │                              │ bcrypt.compare()         │
     │                              │                          │
     │                              │ jwt.sign()               │
     │                              │                          │
     │ ◄─────────────────────────────│                          │
     │ {token, user}                │                          │
     │                              │                          │
     │ Store token in localStorage  │                          │
     │                              │                          │
     │ GET /movie-events            │                          │
     │ Authorization: Bearer <token>│                          │
     │─────────────────────────────►│                          │
     │                              │                          │
     │                              │ jwt.verify(token)        │
     │                              │                          │
     │                              │ Query events             │
     │                              │─────────────────────────►│
     │                              │                          │
     │                              │ ◄────────────────────────│
     │ ◄─────────────────────────────│                          │
     │ {events, total}              │                          │
     │                              │                          │
```

**JWT Middleware:**
```typescript
// middleware/auth.ts
export const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' })
  }
}
```

### Scraping Architecture

**Scrapers run on-demand** via admin trigger or scheduled cron jobs.

**Flow:**
```
Admin triggers scraper
  ↓
Puppeteer launches headless browser
  ↓
Navigate to theater website
  ↓
Extract showtime data (dates, times, titles, formats)
  ↓
Parse and structure data
  ↓
Upsert MovieEvent records to database
  ↓
Trigger OMDB enrichment for new titles
  ↓
OMDB API fetches metadata (description, genres, IDs)
  ↓
Upsert MovieData records
  ↓
Link MovieEvent ← MovieData (foreign key)
  ↓
Frontend fetches updated events
```

**Scraper Structure:**
```typescript
export const runCinema21Scraper = async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  await page.goto('https://cinema21.com/calendar')

  const events = await page.evaluate(() => {
    // Extract DOM data
    return Array.from(document.querySelectorAll('.event')).map(el => ({
      title: el.querySelector('.title').textContent,
      date: el.querySelector('.date').textContent,
      // ... more fields
    }))
  })

  await browser.close()

  // Process and save to database
  for (const event of events) {
    await prisma.movieEvent.upsert({
      where: { /* unique constraint */ },
      update: event,
      create: event
    })
  }
}
```

**Challenges:**
- Websites change structure frequently
- Anti-bot measures (some theaters block scrapers)
- Rate limiting
- Data inconsistency (typos, formatting differences)

**OMDB Integration:**
```typescript
// services/omdbService.ts
export const enrichMovieData = async (title: string) => {
  const response = await fetch(
    `http://www.omdbapi.com/?apikey=${API_KEY}&t=${encodeURIComponent(title)}`
  )
  const data = await response.json()

  return {
    description: data.Plot,
    imageUrl: data.Poster,
    imdbId: data.imdbID,
    genres: data.Genre.split(', '),
    // ... more fields
  }
}
```

### API Request Flow

```
Client Request
  ↓
Express Middleware (cors, helmet, body parser)
  ↓
Auth Middleware (if protected route)
  ↓
Route Handler
  ↓
Controller (validation, business logic)
  ↓
Service Layer (database operations via Prisma)
  ↓
Database Query
  ↓
Response Formatting
  ↓
JSON Response to Client
```

### Error Handling

**Pattern:**
```typescript
app.use((err, req, res, next) => {
  console.error(err.stack)

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message })
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  res.status(500).json({ error: 'Internal server error' })
})
```

---

## Data Flow

### Public User Journey

```
User visits /
  ↓
MovieEvents page loads
  ↓
useEffect triggers fetchEvents()
  ↓
API GET /movie-events
  ↓
Server queries database with filters
  ↓
Returns {events, total, totalPages}
  ↓
Store updates (setEvents)
  ↓
Component re-renders with event cards
  ↓
User applies filters
  ↓
Debounced filter update triggers fetchEvents()
  ↓
... (cycle repeats)
```

### Admin Event Creation

```
Admin logs in → receives JWT
  ↓
Navigates to /admin
  ↓
Opens "Create Event" modal
  ↓
Fills form (react-hook-form manages state)
  ↓
Submits form
  ↓
Validation (yup schema)
  ↓
If valid: movieEventStore.createEvent(data)
  ↓
API POST /movie-events (with JWT header)
  ↓
Server validates token
  ↓
Controller validates data
  ↓
Prisma creates database record
  ↓
Returns new event object
  ↓
Store adds event to local state
  ↓
UI updates to show new event
  ↓
Modal closes
```

### Scraper Data Flow

```
Admin triggers scraper
  ↓
POST /admin/run-scrapers {scrapers: ['cinema21']}
  ↓
Server spawns scraper process
  ↓
Puppeteer scrapes theater website
  ↓
Extracts event data
  ↓
For each event:
  - Check if exists (by title + date + theatre)
  - Upsert MovieEvent
  - If new title, fetch OMDB data
  - Upsert MovieData
  - Link event ← movieData
  ↓
Scraper completes
  ↓
Frontend can now fetch updated events
```

---

## Deployment Architecture

### Development

```
┌─────────────────┐         ┌─────────────────┐
│  Vite Dev Server│         │  Node + Nodemon │
│  localhost:5173 │────────►│  localhost:3021 │
│  (Frontend)     │  API    │  (Backend)      │
└─────────────────┘         └─────────┬───────┘
                                      │
                            ┌─────────▼───────┐
                            │  PostgreSQL     │
                            │  (Docker)       │
                            │  localhost:5432 │
                            └─────────────────┘
```

### Production (Inferred - Railway)

```
┌──────────────────────────────────┐
│  Railway Container               │
│                                  │
│  ┌────────────────────────────┐ │
│  │  Node.js Express Server    │ │
│  │                            │ │
│  │  Serves:                   │ │
│  │  - /api/* (REST API)       │ │
│  │  - /* (React static files) │ │
│  └────────────┬───────────────┘ │
│               │                  │
│               │                  │
│  ┌────────────▼───────────────┐ │
│  │  PostgreSQL (Railway DB)   │ │
│  └────────────────────────────┘ │
│                                  │
└──────────────────────────────────┘
          ▲
          │ HTTPS
          │
    ┌─────┴─────┐
    │   Users   │
    └───────────┘
```

**Build Process:**
1. Build frontend: `npm run build` (creates `client/dist`)
2. Copy `client/dist` to `server/client-build`
3. Build backend: `npm run build` (TypeScript → JavaScript)
4. Start server: `npm start`
5. Server serves React app at `/` and API at `/api`

---

## Performance Considerations

### Frontend

**Optimizations in place:**
- Material-UI tree-shaking
- React lazy loading for routes (can be improved)
- Debounced search (500ms)
- Pagination (server-side, limit 50)
- MUI DataGrid virtualization

**Areas for improvement:**
- Code splitting not implemented
- No image lazy loading
- No service worker/caching
- Large bundle size (entire app loaded upfront)
- No CDN for static assets

### Backend

**Optimizations in place:**
- Database indexing on frequently queried fields
- Pagination for large result sets
- Helmet for security headers
- Compression middleware (likely)

**Areas for improvement:**
- No query result caching
- N+1 query problem (movieData eager loading)
- No connection pooling visible
- No rate limiting
- Scrapers run synchronously (blocks server)

### Database

**Optimizations:**
- Indexes on `date`, `theatre`, `movieDataId`, `imdbId`
- Foreign key relationships

**Potential issues:**
- Offset-based pagination inefficient at high offsets
- No database-level caching
- Full-text search could be improved (currently uses LIKE)

---

## Security

### Current Measures

- **JWT authentication** for admin routes
- **bcrypt password hashing** (12 rounds)
- **Helmet** for security headers
- **CORS** configured
- **Environment variables** for secrets
- **Prepared statements** via Prisma (SQL injection protection)

### Vulnerabilities & Improvements Needed

1. **No refresh tokens** - JWT expires, forcing re-login
2. **LocalStorage for tokens** - XSS vulnerability (consider httpOnly cookies)
3. **No rate limiting** - susceptible to brute force
4. **No CSRF protection**
5. **API keys in code** - OMDB key should rotate
6. **No input sanitization** visible
7. **Error messages leak info** - stack traces in responses
8. **No audit logging**
9. **Admin password in .env** - should be seeded securely
10. **No 2FA option**

---

## Scalability

### Current Limitations

1. **Single server** - no horizontal scaling
2. **Synchronous scrapers** - block server during execution
3. **No caching layer** - every request hits database
4. **Offset pagination** - slow at high page numbers
5. **No CDN** - static assets served from Node.js
6. **No load balancing**
7. **No database replication**

### Recommendations for Scale

1. **Move scrapers to background jobs** (Bull queue with Redis)
2. **Add Redis caching** for frequently accessed data
3. **Implement cursor-based pagination**
4. **Use CDN** for static frontend assets
5. **Database read replicas** for queries
6. **Horizontal scaling** with load balancer
7. **Containerization** (Docker/Kubernetes)
8. **API Gateway** for rate limiting and caching

---

## Testing Strategy (Currently Absent)

### Recommended Approach

**Frontend:**
- **Unit tests:** React Testing Library for components
- **Integration tests:** Test user flows with Playwright
- **E2E tests:** Full journeys (login → create event → verify)

**Backend:**
- **Unit tests:** Jest for services and controllers
- **Integration tests:** Supertest for API endpoints
- **Database tests:** In-memory Prisma for fast tests

**Scrapers:**
- **Mock responses:** Test parsing without hitting live sites
- **Snapshot tests:** Ensure consistent data structure

---

## Monitoring & Observability (Currently Absent)

### Recommended Tooling

1. **Error tracking:** Sentry
2. **Logging:** Winston or Pino (structured logs)
3. **APM:** New Relic or Datadog
4. **Uptime monitoring:** UptimeRobot
5. **Analytics:** Google Analytics (already present), Plausible
6. **Database monitoring:** Prisma Pulse or pg_stat_statements

---

## Summary

Panopticon is a well-structured, modern full-stack application with:
- Clean separation of concerns
- Strong typing with TypeScript
- Effective use of modern frameworks
- Good foundational architecture

**Strengths:**
- Modular, maintainable codebase
- Type-safe throughout
- Responsive, accessible UI
- Clear data models

**Areas for improvement:**
- Testing coverage
- Performance optimization
- Security hardening
- Scalability preparation
- Monitoring and logging
- Documentation (now addressed!)

The architecture supports current needs well and can scale with thoughtful improvements outlined in this document.
