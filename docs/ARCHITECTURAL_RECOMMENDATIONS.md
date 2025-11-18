# Senior Architect Recommendations

As a senior architect, here are my prioritized recommendations for Panopticon's evolution from a well-built application to an enterprise-grade platform.

## Executive Summary

**Current State:** Panopticon is a well-architected, modern full-stack application with solid fundamentals. The codebase demonstrates good engineering practices with TypeScript, React, and Prisma.

**Grade: B+**
- Strong foundation with modern tech stack
- Clean separation of concerns
- Type-safe throughout
- Good UI/UX with Material-UI

**Primary Gaps:**
- No testing infrastructure (critical)
- Incomplete features need finishing
- Security hardening required
- Performance optimization opportunities
- Monitoring and observability absent

---

## Critical Path (Next 2 Weeks)

These items block production readiness and should be addressed immediately.

### 1. Complete In-Progress Features

**EventEditor.tsx** and **MovieData modal** are partially implemented.

**Impact:** Broken admin functionality affects content management workflow.

**Action Items:**
```typescript
// EventEditor.tsx - Implement inline editing
- Add DataGrid with edit mode enabled
- Implement row edit handlers
- Add validation
- Handle save/cancel operations

// MovieData modal - Complete view/edit tabs
- Implement view tab with read-only fields
- Implement edit tab with form
- Add save/cancel logic
```

**Effort:** 2-3 days
**Risk if skipped:** Admin users cannot efficiently manage content

### 2. Fix TypeScript Errors

**`@ts-expect-error` suppressions** hide underlying type issues.

**Impact:** Type safety compromised, potential runtime errors.

**Action:**
```typescript
// Admin/index.tsx
// Instead of @ts-expect-error, properly type the props
interface MovieDataGridProps {
  rows: MovieDataProps[]
  columns: GridColDef<MovieDataProps>[]  // Properly typed
}

// Replace 'any' types
movieData: MovieData  // Import from @prismaTypes
```

**Effort:** 1 day
**Risk if skipped:** Runtime errors in production, harder debugging

### 3. Security Hardening

**Multiple security concerns** need immediate attention.

#### 3.1 Remove Debug Logging
```typescript
// authService.ts - REMOVE these lines
console.log("🔐 validateToken request started");
console.log("📤 validateToken response received:", response);
```

#### 3.2 Implement Rate Limiting
```typescript
// server/src/app.ts
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many login attempts, please try again later'
});

app.use('/api/auth/login', authLimiter);
```

#### 3.3 Secure JWT Token Storage
```typescript
// Option 1: httpOnly cookies (preferred)
res.cookie('token', jwt, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000
});

// Option 2: Refresh tokens
// Implement short-lived access tokens (15 min) + long-lived refresh tokens
```

**Effort:** 2 days
**Risk if skipped:** Security vulnerabilities, potential data breach

### 4. Environment Variable Loading Fix

**dotenv.config()** reporting "injecting env (0)" breaks seeding.

**Root Cause:** Path resolution issue in seed script.

**Solution:**
```typescript
// server/prisma/seed.ts
import { config } from 'dotenv';
import { resolve } from 'path';

// Explicitly load from server directory
config({ path: resolve(__dirname, '../.env') });

// Validate required vars
const requiredVars = ['ADMIN_EMAIL', 'ADMIN_PASSWORD', 'ADMIN_NAME'];
for (const varName of requiredVars) {
  if (!process.env[varName]) {
    throw new Error(`Missing required env var: ${varName}`);
  }
}
```

**Effort:** 2 hours
**Risk if skipped:** Deployment issues, broken seeding

---

## High Priority (Next Month)

### 5. Testing Infrastructure

**No tests exist.** This is the biggest gap for a production application.

#### Recommended Setup

**Frontend Testing:**
```bash
npm install --save-dev vitest @testing-library/react @testing-library/user-event jsdom
```

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/']
    }
  }
});
```

**Test Examples:**
```typescript
// components/__tests__/MovieEventCard.test.tsx
describe('MovieEventCard', () => {
  it('displays event details', () => {
    const event = { title: 'The Matrix', date: '2024-01-15', ... };
    render(<MovieEventCard event={event} />);
    expect(screen.getByText('The Matrix')).toBeInTheDocument();
  });
});

// stores/__tests__/movieEventStore.test.ts
describe('movieEventStore', () => {
  it('fetches events successfully', async () => {
    const { result } = renderHook(() => useMovieEventStore());
    await act(() => result.current.fetchEvents());
    expect(result.current.events).toHaveLength(expect.any(Number));
  });
});
```

**Backend Testing:**
```bash
npm install --save-dev jest supertest @types/jest @types/supertest
```

```typescript
// routes/__tests__/movieEvents.test.ts
describe('GET /api/movie-events', () => {
  it('returns paginated events', async () => {
    const res = await request(app)
      .get('/api/movie-events?page=1&limit=10')
      .expect(200);

    expect(res.body).toHaveProperty('events');
    expect(res.body).toHaveProperty('total');
    expect(res.body.events).toHaveLength(expect.any(Number));
  });
});
```

**Coverage Goals:**
- Unit tests: 70%+ coverage
- Integration tests: All API endpoints
- E2E tests: Critical user flows (login → create event → view)

**Effort:** 2 weeks
**ROI:** High - prevents regressions, enables confident refactoring

### 6. Performance Optimization

#### 6.1 Code Splitting
```typescript
// routing/routes.tsx
import { lazy, Suspense } from 'react';

const MovieEvents = lazy(() => import('../pages/MovieEvents'));
const Admin = lazy(() => import('../pages/Admin'));

export const routes = [
  {
    path: '/',
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <MovieEvents />
      </Suspense>
    )
  }
];
```

#### 6.2 Redis Caching
```typescript
// server/src/cache/redis.ts
import Redis from 'ioredis';

export const redis = new Redis(process.env.REDIS_URL);

// Wrapper function
export const cacheGet = async <T,>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl = 300
): Promise<T> => {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  const fresh = await fetchFn();
  await redis.setex(key, ttl, JSON.stringify(fresh));
  return fresh;
};

// Usage in controller
app.get('/api/movie-events', async (req, res) => {
  const cacheKey = `events:${JSON.stringify(req.query)}`;
  const data = await cacheGet(cacheKey, () => fetchFromDB(req.query), 300);
  res.json(data);
});
```

#### 6.3 Database Optimizations
```prisma
// Add indexes for commonly filtered fields
model MovieEvent {
  // ...
  @@index([date, theatre])
  @@index([format])
  @@index([isScraped])
  @@fulltext([title, description])
}
```

```typescript
// Use cursor pagination for large datasets
const getEventsCursor = async (cursor?: number, limit = 50) => {
  return prisma.movieEvent.findMany({
    take: limit,
    ...(cursor && {
      skip: 1,
      cursor: { id: cursor }
    }),
    orderBy: { date: 'desc' }
  });
};
```

**Effort:** 1 week
**ROI:** High - better UX, reduced server load

### 7. Monitoring & Observability

**Current state:** No logging, no error tracking, no performance monitoring.

#### 7.1 Structured Logging
```typescript
// server/src/utils/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'panopticon-api' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Usage
logger.info('Event created', { eventId: event.id, userId: req.user.id });
logger.error('Scraper failed', { scraper: 'cinema21', error: err.message });
```

#### 7.2 Error Tracking (Sentry)
```typescript
// server/src/app.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0
});

// Error handler middleware
app.use(Sentry.Handlers.errorHandler());
```

#### 7.3 Performance Monitoring
```typescript
// APM setup (e.g., New Relic, Datadog)
import newrelic from 'newrelic';

// Custom metrics
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    newrelic.recordMetric(`API/${req.method}${req.path}`, duration);
  });
  next();
});
```

**Effort:** 3 days
**ROI:** Critical for production - enables debugging and performance tracking

---

## Medium Priority (Next Quarter)

### 8. Move Scrapers to Background Jobs

**Current:** Scrapers run synchronously, blocking the server.

**Recommended:** Use Bull queue with Redis.

```typescript
// server/src/queues/scraperQueue.ts
import Queue from 'bull';

export const scraperQueue = new Queue('scrapers', {
  redis: process.env.REDIS_URL
});

// Register processors
scraperQueue.process('cinema21', async (job) => {
  logger.info('Starting cinema21 scraper', { jobId: job.id });
  const result = await runCinema21Scraper();
  logger.info('Completed cinema21 scraper', { eventsAdded: result.count });
  return result;
});

// Error handling
scraperQueue.on('failed', (job, err) => {
  logger.error('Scraper job failed', {
    jobId: job.id,
    scraper: job.name,
    error: err.message
  });
});

// In API endpoint
app.post('/admin/run-scrapers', async (req, res) => {
  const { scrapers } = req.body;

  for (const scraper of scrapers) {
    await scraperQueue.add(scraper, {}, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 }
    });
  }

  res.json({ message: 'Scrapers queued', count: scrapers.length });
});
```

**Benefits:**
- Non-blocking API
- Automatic retries
- Job tracking and monitoring
- Scalable across multiple workers

**Effort:** 1 week
**ROI:** Medium - improves API responsiveness

### 9. Refactor Large Components

**MovieData.tsx** (~450 lines) should be broken down.

**Recommended Structure:**
```
Admin/MovieData/
├── index.tsx                 # Main component (orchestration)
├── MovieDataGrid.tsx         # DataGrid configuration
├── MovieDataFilters.tsx      # Filter controls
├── MovieDataModal.tsx        # View/edit modal
├── hooks/
│   ├── useMovieDataGrid.ts  # Grid state logic
│   └── useMovieDataFilters.ts # Filter logic
└── types.ts                  # Local types
```

**Benefits:**
- Easier to test
- Better code reuse
- Clearer responsibilities
- Easier to modify

**Effort:** 2 days
**ROI:** Medium - improves maintainability

### 10. Implement Refresh Tokens

**Current:** JWT expires, users must re-login.

**Recommended:**
```typescript
// Two-token system
// Access token: 15 minutes (in memory or httpOnly cookie)
// Refresh token: 7 days (httpOnly cookie, stored in DB)

// server/src/controllers/authController.ts
export const login = async (req, res) => {
  // ... authenticate user

  const accessToken = jwt.sign({ userId: user.id }, ACCESS_SECRET, {
    expiresIn: '15m'
  });

  const refreshToken = jwt.sign({ userId: user.id }, REFRESH_SECRET, {
    expiresIn: '7d'
  });

  // Store refresh token in DB
  await prisma.refreshToken.create({
    data: { userId: user.id, token: refreshToken }
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.json({ accessToken, user });
};

// Refresh endpoint
export const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
  const stored = await prisma.refreshToken.findUnique({
    where: { token: refreshToken }
  });

  if (!stored) throw new Error('Invalid refresh token');

  const accessToken = jwt.sign({ userId: decoded.userId }, ACCESS_SECRET, {
    expiresIn: '15m'
  });

  res.json({ accessToken });
};
```

**Benefits:**
- Better UX (no forced re-login)
- More secure (short-lived access tokens)
- Revocable sessions

**Effort:** 2 days
**ROI:** Medium - better UX and security

---

## Low Priority / Future Enhancements

### 11. Progressive Web App (PWA)

Add service worker for offline support and installability.

**Effort:** 1 week
**ROI:** Low - nice to have, not critical

### 12. Advanced Features

- User accounts (non-admin)
- Favorite theaters
- Email notifications
- Social sharing
- Calendar export

**Effort:** 4-6 weeks
**ROI:** Medium - increases user engagement

### 13. Mobile App

React Native app for iOS/Android.

**Effort:** 2-3 months
**ROI:** Medium - expands audience

---

## Architecture Evolution Roadmap

### Phase 1: Stabilization (Weeks 1-2)
- ✅ Complete in-progress features
- ✅ Fix TypeScript errors
- ✅ Security hardening
- ✅ Environment variable fixes

### Phase 2: Quality (Weeks 3-4)
- ✅ Testing infrastructure
- ✅ Error handling improvements
- ✅ Monitoring and logging
- ✅ Performance optimization

### Phase 3: Scale (Weeks 5-8)
- ✅ Background job queue
- ✅ Caching layer (Redis)
- ✅ Database optimizations
- ✅ Refactoring large components

### Phase 4: Enhancement (Months 3-6)
- ✅ Refresh tokens
- ✅ PWA features
- ✅ Advanced user features
- ✅ Analytics dashboard

---

## Key Metrics to Track

**Performance:**
- Time to First Byte (TTFB) < 200ms
- Largest Contentful Paint (LCP) < 2.5s
- First Input Delay (FID) < 100ms
- Cumulative Layout Shift (CLS) < 0.1

**Reliability:**
- API uptime > 99.9%
- Error rate < 0.1%
- API response time p95 < 500ms

**Quality:**
- Test coverage > 70%
- TypeScript strict mode with no errors
- Zero console.log in production
- All dependencies up to date

**Business:**
- Active admin users
- Events scraped per day
- API requests per minute
- User engagement (page views, time on site)

---

## Technology Recommendations

### Consider Adding

**Must Have:**
1. **Redis** - Caching and job queue
2. **Winston** - Structured logging
3. **Sentry** - Error tracking
4. **Bull** - Background jobs

**Nice to Have:**
1. **Storybook** - Component documentation
2. **Playwright** - E2E testing
3. **Swagger** - API documentation
4. **GraphQL** - Flexible API queries

### Avoid Adding

1. **Another state library** - Zustand works well
2. **CSS framework** - Material-UI is sufficient
3. **ORM besides Prisma** - Stick with one
4. **Class-based components** - Keep functional

---

## Cost-Benefit Analysis

### High ROI Items
1. **Testing** - Prevents bugs, enables confident changes
2. **Monitoring** - Quickly identify and fix issues
3. **Security** - Protects data and reputation
4. **Performance** - Better UX, lower costs

### Medium ROI Items
1. **Refactoring** - Easier maintenance
2. **Background jobs** - Better scalability
3. **Caching** - Lower DB load

### Low ROI Items
1. **PWA** - Nice UX, limited impact
2. **Mobile app** - High effort, uncertain adoption
3. **Advanced features** - Depends on user demand

---

## Final Thoughts

Panopticon is **well-built** with a **solid foundation**. The architecture is clean, the tech stack is modern, and the code quality is good.

**To reach production-grade:**
1. Add comprehensive testing
2. Harden security
3. Implement monitoring
4. Optimize performance

**To scale beyond MVP:**
1. Background job processing
2. Caching layer
3. Database optimization
4. Microservices (if needed)

The current architecture can easily handle **10,000+ users** with the optimizations outlined above. Beyond that, consider:
- Horizontal scaling (multiple app instances)
- Database read replicas
- CDN for static assets
- Message queue for inter-service communication

**Grade after improvements: A**

The roadmap above takes you from a well-built application to an enterprise-grade platform ready for production use and scale.
