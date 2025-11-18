# Improvements & Technical Debt

This document outlines areas for improvement, technical debt, and recommendations for enhancing Panopticon.

## Critical Issues

### 1. Complete In-Progress Features

**Priority: HIGH**

Several features are partially implemented and need completion:

**EventEditor.tsx** (src/pages/Admin/EventEditor.tsx)
- File exists but is essentially empty (1 line)
- Should provide inline editing capabilities for events
- **Action:** Complete the component with full CRUD operations

**AdminMovieData Modal** (src/pages/Admin/MovieData.tsx)
- View/edit tabs commented out in DataGrid
- Modal exists but not fully functional
- **Action:** Implement view and edit functionality

**Patreon Integration**
- Comment in code: `userIsPatreonMember = false // TODO: Replace with real check`
- **Action:** Implement real Patreon OAuth and member verification

### 2. Fix TypeScript Errors

**Priority: HIGH**

**Admin/index.tsx:line ???**
```typescript
// @ts-expect-error TS2345
```
- Type mismatch not properly resolved
- **Action:** Fix the underlying type issue instead of suppressing

**MovieData Store Types**
```typescript
movieData: any // Should be properly typed
```
- Several `any` types used where proper types exist
- **Action:** Replace with proper TypeScript types from `@prismaTypes`

### 3. Environment Variable Loading

**Priority: MEDIUM**

The seed script and dotenv configuration has issues:
- dotenv.config() reporting "injecting env (0)"
- Path resolution problems in seed.ts
- **Action:** Fix path resolution or use alternative env loading strategy
- **Recommendation:** Use a config service that loads and validates env vars

### 4. Security Hardening

**Priority: HIGH**

**Remove Console Logs**
```typescript
// authService.ts validateToken()
console.log("🔐 validateToken request started");
console.log("📤 validateToken response received:", response);
```
- Debug logs left in production code
- May leak sensitive information
- **Action:** Remove or use proper logger with log levels

**JWT Token Storage**
- Tokens stored in localStorage (XSS vulnerable)
- **Recommendation:** Consider httpOnly cookies for tokens
- **Alternative:** Implement refresh tokens to limit exposure

**Hardcoded Secrets**
```bash
VITE_AUTH_CODE='69420'  # Appears unused but concerning
```
- **Action:** Remove if unused, or properly implement if needed

**No Rate Limiting**
- Login endpoint vulnerable to brute force
- **Action:** Implement rate limiting (express-rate-limit)

**Input Sanitization**
- No visible input sanitization on backend
- **Action:** Add sanitization middleware (DOMPurify on frontend, validator on backend)

---

## High Priority Improvements

### 5. Add Testing Infrastructure

**Priority: HIGH**

Currently no tests exist.

**Recommended Setup:**

**Frontend:**
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest
```

**Example Test Structure:**
```
src/
├── components/
│   ├── MovieEventCard/
│   │   ├── index.tsx
│   │   └── __tests__/
│   │       └── MovieEventCard.test.tsx
└── stores/
    └── __tests__/
        └── movieEventStore.test.ts
```

**Backend:**
```bash
npm install --save-dev jest supertest @types/jest @types/supertest
```

**Test Coverage Goals:**
- Unit tests: 70%+ coverage
- Integration tests for all API endpoints
- E2E tests for critical user journeys

### 6. Improve Error Handling

**Priority: HIGH**

**Frontend:**
- Limited error context in service layer
- Global auth errors redirect with no user feedback
- **Action:** Implement toast notifications (react-hot-toast or MUI Snackbar)
- **Action:** Add error boundary components
- **Action:** Provide actionable error messages

**Backend:**
- Error messages may leak stack traces in production
- **Action:** Differentiate development vs production error responses
- **Action:** Implement structured error responses:
```typescript
{
  error: {
    code: "VALIDATION_ERROR",
    message: "User-friendly message",
    details: {...}  // Only in development
  }
}
```

### 7. Implement Request Retry Logic

**Priority: MEDIUM**

API requests fail immediately with no retries.

**Recommendation:**
```typescript
// utils/fetchWithRetry.ts
export async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 3,
  backoff = 300
): Promise<Response> {
  try {
    return await fetch(url, options);
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    throw error;
  }
}
```

### 8. Optimize Performance

**Priority: MEDIUM**

**Frontend:**
- **Code splitting:** Implement route-based code splitting
```typescript
// routing/routes.tsx
const MovieEvents = lazy(() => import('../pages/MovieEvents'));
const Admin = lazy(() => import('../pages/Admin'));
```

- **Image optimization:**
  - Lazy load images with Intersection Observer
  - Use responsive images (srcset)
  - Consider image CDN (Cloudinary, Imgix)

- **Bundle analysis:**
```bash
npm install --save-dev vite-plugin-bundle-analyzer
```

**Backend:**
- **Implement caching:**
```typescript
// Add Redis for frequently accessed data
import Redis from 'ioredis';
const redis = new Redis();

// Cache movie events for 5 minutes
app.get('/api/movie-events', async (req, res) => {
  const cacheKey = `events:${JSON.stringify(req.query)}`;
  const cached = await redis.get(cacheKey);

  if (cached) {
    return res.json(JSON.parse(cached));
  }

  const data = await fetchEventsFromDB(req.query);
  await redis.setex(cacheKey, 300, JSON.stringify(data));
  res.json(data);
});
```

- **Database query optimization:**
  - Add indexes for commonly filtered fields
  - Use SELECT only needed fields (not `SELECT *`)
  - Implement cursor-based pagination for large datasets

### 9. Add Monitoring & Logging

**Priority: MEDIUM**

**Logging:**
```bash
npm install winston
```

```typescript
// utils/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}
```

**Error Tracking:**
- Integrate Sentry for error tracking
- Add source maps for production debugging

---

## Medium Priority Improvements

### 10. Refactor Large Components

**Priority: MEDIUM**

**MovieData.tsx** (~450+ lines)
- Extract DataGrid configuration into separate file
- Extract modal components
- Extract filter logic into custom hooks

**Suggested Structure:**
```
Admin/MovieData/
├── index.tsx (main component)
├── MovieDataGrid.tsx
├── MovieDataFilters.tsx
├── MovieDataModal.tsx
├── hooks/
│   ├── useMovieDataFilters.ts
│   └── useMovieDataGrid.ts
└── types.ts
```

### 11. Improve State Management

**Priority: MEDIUM**

**Current Issues:**
- Duplicate pagination logic across stores
- No optimistic updates (UI waits for server response)

**Recommendations:**

**Create Reusable Pagination Hook:**
```typescript
// hooks/usePagination.ts
export function usePagination<T>(
  fetchFn: (page: number, limit: number) => Promise<{ items: T[], total: number }>
) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);

  const loadPage = useCallback(async () => {
    const result = await fetchFn(page, limit);
    setData(result.items);
    setTotal(result.total);
  }, [page, limit, fetchFn]);

  return { page, limit, data, total, setPage, setLimit, loadPage };
}
```

**Implement Optimistic Updates:**
```typescript
// Example: Delete with optimistic update
deleteEvent: (id) => {
  const previousEvents = get().events;

  // Optimistically update UI
  set({ events: previousEvents.filter(e => e.id !== id) });

  // Send to server
  movieEventService.deleteEvent(id)
    .catch(error => {
      // Revert on error
      set({ events: previousEvents, error: error.message });
    });
}
```

### 12. Database Improvements

**Priority: MEDIUM**

**Add Full-Text Search:**
```prisma
// prisma/schema.prisma
model MovieEvent {
  // ... existing fields
  @@index([title], type: FullText)
}
```

**Implement Cursor-Based Pagination:**
```typescript
// Instead of offset/limit
const events = await prisma.movieEvent.findMany({
  take: limit,
  skip: 1, // Skip the cursor
  cursor: {
    id: cursorId,
  },
  orderBy: {
    id: 'asc',
  },
});
```

**Add Database Migrations Strategy:**
- Use Prisma Migrate for all schema changes
- Keep migrations in version control
- Test migrations in staging before production

### 13. Scraper Improvements

**Priority: MEDIUM**

**Move to Background Jobs:**
```bash
npm install bull
```

```typescript
// services/scraperQueue.ts
import Queue from 'bull';

export const scraperQueue = new Queue('scrapers', {
  redis: process.env.REDIS_URL
});

scraperQueue.process('cinema21', async (job) => {
  return runCinema21Scraper();
});

// In API endpoint
app.post('/admin/run-scrapers', async (req, res) => {
  const { scrapers } = req.body;

  for (const scraper of scrapers) {
    await scraperQueue.add(scraper, {});
  }

  res.json({ message: 'Scrapers queued' });
});
```

**Add Error Handling & Retries:**
```typescript
scraperQueue.on('failed', (job, err) => {
  logger.error(`Scraper ${job.name} failed:`, err);
});

scraperQueue.process('cinema21', {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000
  }
}, async (job) => {
  return runCinema21Scraper();
});
```

**Add Scraper Status Tracking:**
```prisma
model ScraperRun {
  id         Int      @id @default(autoincrement())
  scraper    String
  status     String   // 'running' | 'success' | 'failed'
  eventsAdded Int     @default(0)
  error      String?
  startedAt  DateTime @default(now())
  completedAt DateTime?
}
```

### 14. API Versioning

**Priority: LOW**

Prepare for future API changes:

```typescript
// routes/v1/index.ts
import { Router } from 'express';
const router = Router();

router.use('/movie-events', movieEventRoutes);
router.use('/admin', adminRoutes);
router.use('/auth', authRoutes);

export default router;

// app.ts
app.use('/api/v1', v1Routes);

// Allow both for backward compatibility
app.use('/api', v1Routes);
```

---

## Low Priority / Future Enhancements

### 15. PWA Features

**Priority: LOW**

Convert to Progressive Web App:
- Service Worker for offline support
- App manifest for installability
- Push notifications for new events

### 16. Advanced Features

**Priority: LOW**

**User Features:**
- User accounts (non-admin)
- Favorite theaters
- Calendar export (iCal)
- Email notifications for favorite theaters
- Social sharing

**Admin Features:**
- Bulk edit operations
- Event templates
- Automated duplicate detection
- Analytics dashboard
- Export data to CSV/JSON

**Technical:**
- GraphQL API option
- Real-time updates via WebSockets
- Mobile app (React Native)
- Recommendation engine

### 17. Accessibility Improvements

**Priority: MEDIUM**

- Run WAVE and axe DevTools audits
- Add skip navigation links
- Ensure all images have alt text
- Test with screen readers
- Add ARIA labels where needed
- Improve keyboard navigation

### 18. Documentation Improvements

**Priority: LOW** (now addressed!)

- Component library with Storybook
- API documentation with Swagger/OpenAPI
- Architecture Decision Records (ADRs)
- Runbook for common operations
- Deployment guide

---

## Quick Wins (Easy Improvements)

These can be done quickly for immediate benefit:

1. **Add loading skeletons** instead of spinners (better UX)
2. **Add debouncing to all search inputs** (already done in some places)
3. **Show toast notifications** for success/error actions
4. **Add confirmation dialogs** for destructive actions (delete all, etc.)
5. **Add "last updated" timestamp** to data displays
6. **Implement dark mode persistence** (localStorage)
7. **Add keyboard shortcuts** for common actions (Cmd+K to search, etc.)
8. **Add empty states** for lists with no data
9. **Add pagination info** ("Showing 1-50 of 150 events")
10. **Add CSV export** for admin data

---

## Code Quality Improvements

### ESLint Rules to Add

```javascript
// eslint.config.js
export default [
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error', // No more any types
      '@typescript-eslint/explicit-function-return-type': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'react-hooks/exhaustive-deps': 'error',
    }
  }
]
```

### Prettier Configuration

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "avoid"
}
```

### Pre-commit Hooks

```bash
npm install --save-dev husky lint-staged

# package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

---

## Migration Path (Recommended Order)

For systematic improvement, tackle in this order:

**Phase 1: Stability** (Weeks 1-2)
1. Fix TypeScript errors
2. Complete in-progress features
3. Add error handling and logging
4. Security hardening

**Phase 2: Quality** (Weeks 3-4)
5. Add testing infrastructure
6. Refactor large components
7. Add monitoring
8. Performance optimization

**Phase 3: Scale** (Weeks 5-8)
9. Implement caching
10. Move scrapers to background jobs
11. Database optimizations
12. API improvements

**Phase 4: Enhancement** (Ongoing)
13. New features
14. PWA capabilities
15. Advanced analytics
16. Mobile app

---

## Summary

**Critical (Do First):**
- Complete EventEditor and MovieData features
- Fix TypeScript errors
- Security hardening (remove console logs, add rate limiting)
- Add testing

**High Value (Do Soon):**
- Error handling improvements
- Performance optimization
- Monitoring and logging
- Code refactoring

**Nice to Have (Do Eventually):**
- PWA features
- Advanced features
- API versioning

The codebase is in good shape overall. These improvements will take it from "good" to "excellent" and prepare it for scale.
