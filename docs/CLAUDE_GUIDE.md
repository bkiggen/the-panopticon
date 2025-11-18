# Quick Reference Guide for AI Assistants

This document provides quick context for AI assistants (like Claude) working on Panopticon.

## Project Summary

**Panopticon** is a movie theater event aggregator for Portland, Oregon independent cinemas.

- **Type:** Full-stack web application
- **Frontend:** React 19 + TypeScript + Vite + Material-UI + Zustand
- **Backend:** Node.js + Express + Prisma + PostgreSQL
- **Purpose:** Scrape theater websites, display showtimes, admin management

## Quick File Location Reference

### Common Tasks → File Locations

| Task | File Path |
|------|-----------|
| Add new API endpoint | `server/src/routes/*.ts` |
| Create new page | `client/src/pages/*/index.tsx` |
| Add UI component | `client/src/components/*` |
| Modify state logic | `client/src/stores/*Store.ts` |
| API service calls | `client/src/services/*Service.ts` |
| Database schema | `server/prisma/schema.prisma` |
| Add constants (theaters, genres) | `client/src/lib/*.ts` |
| Auth logic | `server/src/middleware/auth.ts` |
| Scraper code | `server/src/cron/scrapers/*.ts` |
| TypeScript types | `client/src/types/*.ts` or `server/src/types/*.ts` |

## Key Directories

```
panopticon/
├── client/               # Frontend (React)
│   └── src/
│       ├── components/   # Reusable UI (MovieEventCard, Filters, etc.)
│       ├── pages/        # Routes (MovieEvents, Admin, Auth)
│       ├── services/     # API calls (movieEventService, authService)
│       ├── stores/       # Zustand stores (movieEventStore, sessionStore)
│       └── lib/          # Constants (THEATRES, GENRES, FORMATS)
└── server/               # Backend (Node.js)
    └── src/
        ├── routes/       # Express routes
        ├── controllers/  # Business logic
        ├── middleware/   # Auth, validation
        └── cron/scrapers/# Web scrapers
```

## Data Models

### MovieEvent (Primary)
```typescript
{
  id: number
  title: string
  date: string (ISO)
  times: string[] (e.g., ["7:00pm"])
  format: "Digital" | "35mm" | "70mm" | "16mm" | "VHS"
  theatre: string
  accessibility: string[]
  movieData: MovieData (optional relationship)
}
```

### MovieData (Enriched metadata)
```typescript
{
  id: number
  title: string
  description: string
  genres: string[]
  imdbId: string
  rottenTomatoesId: string
}
```

## State Management (Zustand)

### Stores
1. **sessionStore** - Auth state (token, user, isAuthenticated)
2. **movieEventStore** - Public events with pagination/filters
3. **movieDataStore** - Admin movie metadata management

### Pattern
```typescript
const useStore = create((set, get) => ({
  // State
  items: [],
  loading: false,

  // Computed
  count: () => get().items.length,

  // Actions
  setItems: (items) => set({ items }),

  // Thunks (async)
  fetchItems: async () => {
    set({ loading: true });
    const data = await service.getItems();
    set({ items: data, loading: false });
  }
}));
```

## API Patterns

### Frontend → Backend Flow
```
Component → Store → Service → API → Server Route → Controller → Prisma → Database
```

### API Base URL
- Dev: `http://localhost:3021/api`
- Prod: `/api` (same domain)

### Auth Header
```
Authorization: Bearer <jwt_token>
```

## Common Patterns

### Adding a New Feature

**Frontend:**
1. Create component in `client/src/components/`
2. Add to page in `client/src/pages/`
3. Create service in `client/src/services/`
4. Add store if complex state needed in `client/src/stores/`
5. Add types in `client/src/types/`

**Backend:**
1. Update Prisma schema if DB changes needed
2. Run `npx prisma migrate dev`
3. Add route in `server/src/routes/`
4. Add controller logic
5. Update types

### Forms
- Use `react-hook-form` + `yup` for validation
- Use `Controller` for MUI components
- Use `useFieldArray` for dynamic fields (like times)

### API Calls
- All go through service modules
- Use `authenticatedFetch` for protected endpoints
- Services are in `client/src/services/`

## Important Constants

### Theaters (client/src/lib/theatres.ts)
```typescript
export const THEATRES = [
  "Cinema 21",
  "Academy Theater",
  "Laurelhurst Theater",
  "Tomorrow Theater",
  "Hollywood Theater",
  // ... more
]
```

### Formats (client/src/lib/formats.ts)
```typescript
export const FORMATS = ["Digital", "35mm", "70mm", "16mm", "VHS"]
```

### Genres (client/src/lib/genres.ts)
```typescript
export const GENRES = [
  "Action", "Comedy", "Drama", "Horror",
  "Sci-Fi", "Documentary", // ... more
]
```

## Environment Variables

### Client (.env)
```bash
VITE_API_URL=http://localhost:3021/api
```

### Server (.env)
```bash
DATABASE_URL="postgresql://devuser:devpassword@localhost:5432/panopticon"
PORT=3021
NODE_ENV=development
OMDB_API_KEY=your_key
JWT_SECRET=your_secret
ADMIN_EMAIL=admin@panopticon.local
ADMIN_PASSWORD=admin123
```

## Known Issues & Technical Debt

### High Priority
1. **EventEditor.tsx is incomplete** - Needs full implementation
2. **MovieData modal incomplete** - View/edit tabs not functional
3. **TypeScript errors** - Several `@ts-expect-error` suppressions
4. **dotenv loading issue** - Seed script doesn't load .env properly
5. **Console.log statements** - Debug logs in authService.ts

### Security Concerns
1. JWT in localStorage (XSS vulnerable)
2. No rate limiting
3. No refresh tokens
4. Console logs leak info

### Performance
1. No code splitting
2. No image lazy loading
3. Large bundle size
4. N+1 query problem with movieData

## Typical User Requests

### "Add a new theater"
1. Add to `client/src/lib/theatres.ts` THEATRES array
2. Create scraper in `server/src/cron/scrapers/newtheater.ts`
3. Register in `server/src/services/cronService.ts`
4. Add to available scrapers list in admin

### "Fix TypeScript error"
1. Check `client/src/` or `server/src/`
2. Look for `@ts-expect-error` comments
3. Import proper types from `@prismaTypes`
4. Fix underlying type mismatch

### "Add new filter"
1. Add to `movieEventStore` filters
2. Add UI component in `client/src/components/Filters/`
3. Update API query params in `movieEventService`
4. Handle in backend route/controller

### "Change UI styling"
1. MUI components use theme from `client/src/main.tsx`
2. Override in component with `sx` prop
3. Global theme changes in `createTheme()`

## Testing Strategy (Not Yet Implemented)

When adding tests:
- **Frontend:** Vitest + React Testing Library
- **Backend:** Jest + Supertest
- Location: `__tests__` folders next to code

## Deployment

- Development: `npm run dev` in both client and server
- Production: Build client → Copy to server → Serve from Express
- Likely deployed on Railway (inferred from comments)

## Quick Commands

```bash
# Start everything
cd server && docker-compose up -d  # Database
cd server && npm run dev           # Backend
cd client && npm run dev           # Frontend

# Database
npx prisma studio                  # GUI for database
npx prisma migrate dev             # Run migrations
npx prisma generate                # Regenerate client

# Create admin
cd server && node create-admin.js
```

## Code Style

- **TypeScript:** Strict mode enabled
- **Naming:** camelCase (vars/functions), PascalCase (components/types)
- **Components:** Functional with hooks (no class components)
- **Imports:** Absolute paths using `@/*` aliases
- **Formatting:** ESLint configured (run `npm run lint`)

## When User Asks For...

### "Analyze the codebase"
→ Refer to ARCHITECTURE.md

### "How do I..."
→ Refer to DEVELOPMENT.md

### "What needs improvement?"
→ Refer to IMPROVEMENTS.md

### "What are the API endpoints?"
→ Refer to API.md

### "How do I get started?"
→ Refer to README.md

## File Path Shortcuts

For quick reference when navigating:

**Frontend:**
- Main app: `client/src/main.tsx`
- Routes: `client/src/routing/routes.tsx`
- Home page: `client/src/pages/MovieEvents/index.tsx`
- Admin: `client/src/pages/Admin/index.tsx`
- Login: `client/src/pages/Auth/Payphone.tsx`

**Backend:**
- Main app: `server/src/app.ts`
- Auth: `server/src/controllers/authController.ts`
- DB schema: `server/prisma/schema.prisma`

## Shared Types

Frontend can import backend types:
```typescript
import type { MovieEvent } from '@prismaTypes';
```

Configured in `tsconfig.json`:
```json
{
  "paths": {
    "@prismaTypes": ["../server/src/types/index.ts"]
  }
}
```

## Tips for Efficiency

1. **Use the docs/** - All key info is documented
2. **Check lib/ for constants** - Don't hardcode theater/genre names
3. **Follow existing patterns** - Store structure, service pattern, etc.
4. **TypeScript types exist** - Don't use `any`, import from `@prismaTypes`
5. **MUI components** - Use Material-UI components, not custom HTML
6. **Zustand over Context** - State management uses Zustand
7. **React Hook Form** - Don't use uncontrolled forms
8. **Prisma for DB** - Don't write raw SQL

## Red Flags to Avoid

- ❌ Using `any` type
- ❌ Console.log in production code
- ❌ Hardcoding theater/genre names
- ❌ Raw SQL queries (use Prisma)
- ❌ Class components (use functional + hooks)
- ❌ Storing secrets in code
- ❌ Suppressing TypeScript errors with `@ts-expect-error`

## Summary

This is a **modern, well-architected full-stack app** with:
- ✅ Strong TypeScript typing
- ✅ Clean separation of concerns
- ✅ Effective state management (Zustand)
- ✅ Material-UI for consistent design
- ✅ Prisma for type-safe DB access

**Main gaps:**
- No tests
- Some incomplete features
- Security hardening needed
- Performance optimizations needed

**Refer to other docs for details:**
- Architecture → ARCHITECTURE.md
- API Reference → API.md
- Development → DEVELOPMENT.md
- Improvements → IMPROVEMENTS.md
