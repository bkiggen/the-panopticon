# Code Review: Issues to Fix

A direct, opinionated review of things that need attention in Panopticon. This focuses on infrastructure, conventions, and patterns rather than features.

---

## Critical Issues

### 1. `@ts-nocheck` in Production Code

**File:** `server/src/cron/scrapers/academy.ts:1`

```typescript
// @ts-nocheck
```

This completely disables TypeScript checking for the entire file. The Academy scraper is a class-based implementation with untyped methods and `any` types throughout. Either:
- Properly type the scraper, or
- Convert to the same pattern as other scrapers (like `clinton.ts` which is properly typed)

**Why it matters:** TypeScript is pointless if we disable it for complex business logic.

---

### 2. Multiple PrismaClient Instantiations

**Files:**
- `server/src/app.ts:22` - `const prisma = new PrismaClient();`
- `server/src/controllers/authController.ts:8` - `const prisma = new PrismaClient();`
- `server/src/cron/scrapers/academy.ts:13` - `const prisma = new PrismaClient();`
- `server/src/cron/scrapers/clinton.ts:12` - `const prisma = new PrismaClient();`
- (and likely every other scraper)

Each file creates its own PrismaClient instance. This is wasteful and can exhaust database connection pools.

**Fix:** Create a single shared Prisma instance:

```typescript
// server/src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
```

Then import this everywhere instead of creating new instances.

---

### 3. Scraper Running on App Startup

**File:** `server/src/app.ts:17`

```typescript
runCinemagicScraper();
```

This runs a scraper every time the server starts. This is almost certainly unintentional - it means every deploy, every restart, every dev server start triggers a scraper run.

**Fix:** Remove this line. Let scrapers run on their schedule or via explicit admin action.

---

### 4. Permissive CORS Configuration

**File:** `server/src/app.ts:46`

```typescript
app.use(cors());
```

This allows any origin to make requests to your API. In production, this should be restricted:

```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
```

---

### 5. Debug Logging Left in Production

**File:** `server/src/app.ts:62-78`

```typescript
// Debug logging
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`Current working directory: ${process.cwd()}`);
// ... more debug logs
```

This verbose startup logging should be removed or gated behind a DEBUG flag. These look like debugging statements that were never cleaned up.

---

### 6. Duplicate dotenv.config() Calls

**Files:** `server/src/cron/scrapers/academy.ts:6-11`, `server/src/cron/scrapers/clinton.ts:5-10`

```typescript
dotenv.config();

// Load environment variables
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}
```

The comment doesn't match the code - it says "load environment variables" but the condition checks for NOT production, meaning it loads twice in development. Also, `dotenv.config()` is already called once unconditionally on line 6.

**Fix:** Remove the duplicate. dotenv should be loaded once, at app entry point only.

---

### 7. Mixed JavaScript and TypeScript in Scrapers

**Files:**
- `server/src/cron/scrapers/hollywood.js` - JavaScript
- All other scrapers - TypeScript

One scraper is still in plain JavaScript while the rest are TypeScript. This breaks type safety consistency.

**Fix:** Convert `hollywood.js` to TypeScript.

---

## Convention Issues

### 8. Inconsistent Scraper Patterns

The scrapers use different patterns:

- **Academy:** Class-based with extensive "human-like" simulation methods
- **Clinton:** Class-based, cleaner implementation
- **Others:** Mix of styles

There's significant code duplication across scrapers:
- Browser setup logic
- Date parsing/formatting
- Database save logic
- Error handling patterns

**Recommendation:** Create a base scraper class or factory that handles common logic:

```typescript
// BaseScraper.ts
export abstract class BaseScraper {
  abstract theatreName: string;
  abstract baseUrl: string;
  abstract extractEvents(page: Page): Promise<ScrapedEvent[]>;

  // Shared logic
  async setupBrowser() { /* common setup */ }
  async saveToDatabase(events: ScrapedEvent[]) { /* common save */ }
  async run() { /* orchestration */ }
}
```

---

### 9. Root-Level Utility File

**File:** `/utils.ts` (at project root)

```typescript
export const getPacificTime = () => { ... };
export const getTodayInPacific = () => { ... };
export const formatDateForPacific = () => { ... };
```

These utility functions live at the project root, outside of both `client/` and `server/`. This breaks the monorepo structure - utilities should live in the workspace that uses them (server) or in a shared package.

**Fix:** Move to `server/src/utils/timezone.ts` or create a shared `packages/common` workspace.

---

### 10. Hardcoded Default Port Mismatch

**File:** `server/src/app.ts:23`

```typescript
const PORT = parseInt(process.env.PORT || "3000", 10);
```

But other references use 3021:

**File:** `server/src/services/cronService.ts:20`

```typescript
const port = process.env.PORT || 3021;
```

The default port is inconsistent (3000 vs 3021).

---

### 11. `any` Types in Store

**File:** `client/src/stores/movieEventStore.ts:55-56`

```typescript
createEvent: (
  data: any
) => Promise<void>;
```

The `createEvent` method accepts `any` instead of a proper type. This defeats the purpose of TypeScript.

---

### 12. Inconsistent Export Patterns

Some files use named exports, some use default exports, some use both:

```typescript
// clinton.ts
export { CSTScraper };
export { run as runCSTScraper };

// academy.ts
export { HumanLikeAcademyScraper, run as runAcademyScraper };
```

Pick one pattern and stick with it.

---

## Structural Issues

### 13. No Shared Types Package

The monorepo has `client/` and `server/` but no shared types package. Types are duplicated or imported awkwardly:

```typescript
// Client importing from server via path alias
import type { MovieEvent } from "@prismaTypes";
```

**Recommendation:** Create a `packages/types` or `packages/common` workspace for shared types.

---

### 14. Cron Service Self-Calls via HTTP

**File:** `server/src/services/cronService.ts:19-24`

```typescript
export const sendScraperRequest = async () => {
  const port = process.env.PORT || 3021;
  const baseUrl = `http://localhost:${port}`;
  await axios.get(`${baseUrl}/api/admin/run-scrapers`, {
    timeout: 600000,
  });
};
```

The cron job makes an HTTP request to itself to trigger scrapers. This is fragile:
- What if the port changes?
- What if there's a load balancer?
- Why make a network call when you're in the same process?

**Fix:** Call the scraper functions directly instead of going through HTTP.

---

### 15. Mixed Prisma Operations in Scrapers

Each scraper does its own delete-then-insert:

```typescript
// academy.ts:408-412
await prisma.movieEvent.deleteMany({
  where: { theatre: this.theatreName },
});
```

This should be a transaction and should be centralized, not duplicated in every scraper.

---

## Code Quality Issues

### 16. Magic Numbers and Strings

**File:** `server/src/cron/scrapers/academy.ts`

```typescript
const steps = Math.floor(Math.random() * 10) + 10; // 10-20 steps
await this.randomDelay(8000, 15000); // Longer pause to avoid triggering protection
```

These timing values should be constants with descriptive names.

---

### 17. Comments That Don't Match Code

**File:** `server/src/cron/scrapers/academy.ts:407`

```typescript
// First, delete existing Cinema 21 events to avoid duplicates
await prisma.movieEvent.deleteMany({
  where: {
    theatre: this.theatreName,  // But theatreName is "Academy Theater"
  },
});
```

The comment says "Cinema 21" but the code operates on Academy Theater. This was likely copy-pasted.

---

### 18. No Error Recovery in Scrapers

If a scraper fails partway through, there's no recovery mechanism. Events might be partially scraped with some theaters having stale data.

**Recommendation:**
- Use transactions
- Track scraper run status
- Implement retry logic

---

### 19. Unused Express Rate Limiting

**File:** `server/package.json` includes `express-rate-limit` but I don't see it used anywhere in the routes.

Either implement rate limiting (especially on auth routes) or remove the unused dependency.

---

### 20. ApiClient Class vs Functions

**File:** `client/src/services/api/client.ts`

The ApiClient uses static methods exclusively. This is essentially a namespace, not a class. Either:
- Convert to plain exported functions, or
- Make it a proper class with instance methods that can be mocked for testing

---

## Minor Issues

### 21. Typo in Hook Name

**File:** `client/src/hooks/useDebonce.ts`

Should be `useDebounce.ts` (missing 'u').

---

### 22. Inconsistent Date Handling

Different scrapers use different date libraries/approaches:
- Some use native `Date`
- Some manipulate ISO strings directly
- The root `utils.ts` has Pacific timezone helpers

Standardize on a single approach (date-fns or dayjs are both in dependencies).

---

### 23. Prisma Type Path Alias Confusion

**File:** `client/src/stores/movieEventStore.ts:4`

```typescript
import type { MovieEvent } from "@prismaTypes";
```

This path alias points to the server's generated Prisma types. It works but creates a tight coupling between client and server. Better to have explicit shared types.

---

## Summary of Top Priorities

1. **Fix the `@ts-nocheck`** - Properly type the Academy scraper
2. **Create singleton PrismaClient** - Stop instantiating in every file
3. **Remove scraper auto-run on startup** - Line 17 in app.ts
4. **Restrict CORS** - Don't allow all origins
5. **Clean up debug logging** - Remove or gate behind flags
6. **Convert hollywood.js to TypeScript** - Consistency
7. **Fix duplicate dotenv calls** - Load config once at entry
8. **Create base scraper class** - Reduce duplication

---

## What's Good

To be fair, there's a lot that's done well:

- Clean separation between client and server
- Zustand stores are well-structured
- TypeScript is used throughout (with exceptions noted)
- Modern tech stack (React 19, Vite, Prisma)
- Proper JWT authentication flow
- Good use of MUI components
- Helmet for security headers
- Graceful shutdown handling

The bones are good. These fixes are about tightening up the implementation.

---

## Fix Plans

### Plan: Singleton PrismaClient (Issue #2)

**Goal:** Create a single shared Prisma instance to prevent connection pool exhaustion.

**Steps:**

1. Create `server/src/lib/prisma.ts`:
```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

2. Update imports in all files that create PrismaClient:
   - `server/src/app.ts` - remove `const prisma = new PrismaClient()`, import from lib
   - `server/src/controllers/authController.ts` - import from lib
   - `server/src/cron/scrapers/academy.ts` - import from lib
   - `server/src/cron/scrapers/clinton.ts` - import from lib
   - `server/src/cron/scrapers/cinemagic.ts` - import from lib
   - `server/src/cron/scrapers/cinema21.ts` - import from lib
   - `server/src/cron/scrapers/laurelhurst.ts` - import from lib
   - `server/src/cron/scrapers/livingRoom.ts` - import from lib
   - `server/src/cron/scrapers/stJohns.ts` - import from lib
   - `server/src/cron/scrapers/tomorrow.ts` - import from lib
   - Any other files using PrismaClient

3. Remove `dotenv` imports from individual scrapers (handled at app entry)

4. Test that all scrapers and routes still work

---

### Plan: Remove Duplicate dotenv Calls (Issue #6)

**Goal:** Load environment variables once at app entry point.

**Steps:**

1. Ensure `server/src/app.ts` loads dotenv first thing (already does)

2. Remove dotenv imports and calls from all scrapers:
   - `server/src/cron/scrapers/academy.ts` - remove lines 4-11
   - `server/src/cron/scrapers/clinton.ts` - remove lines 3-10
   - Check all other scrapers for similar patterns

3. If scrapers need to run standalone (outside app context), create a separate entry point that loads dotenv

---

### Plan: Move Root utils.ts (Issue #9)

**Goal:** Move Pacific timezone utilities into proper location within monorepo.

**Steps:**

1. Create `server/src/utils/timezone.ts` with contents of root `utils.ts`

2. Find all imports of root utils.ts:
   ```bash
   grep -r "from.*utils" server/src
   ```

3. Update imports to use new path

4. Delete root `utils.ts`

5. If client also needs these utilities, consider:
   - Option A: Duplicate in `client/src/utils/timezone.ts` (simple)
   - Option B: Create `packages/shared` workspace (cleaner but more work)

---

### Plan: Fix Port Mismatch (Issue #10)

**Goal:** Consistent default port across codebase.

**Steps:**

1. Decide on canonical port: **3021** (matches .env and cronService)

2. Update `server/src/app.ts`:
   ```typescript
   const PORT = parseInt(process.env.PORT || "3021", 10);
   ```

3. Verify no other files have hardcoded ports

---

### Plan: Shared Types Package (Issue #13)

**Goal:** Create proper shared types between client and server.

**Steps:**

1. Create new workspace directory: `packages/shared/`

2. Initialize package:
   ```bash
   mkdir -p packages/shared/src
   cd packages/shared
   npm init -y
   ```

3. Update root `package.json` workspaces:
   ```json
   "workspaces": ["client", "server", "packages/*"]
   ```

4. Create `packages/shared/src/types.ts` with shared types:
   - MovieEvent
   - MovieData
   - User (without sensitive fields)
   - API response types

5. Update client and server to import from `@panopticon/shared`

6. Remove `@prismaTypes` path alias from client (or keep as internal server types)

7. Update TypeScript configs to include the new package

---

### Plan: Implement Rate Limiting (Issue #19)

**Goal:** Use the already-installed express-rate-limit to protect auth routes.

**Steps:**

1. Create `server/src/middleware/rateLimiter.ts`:
```typescript
import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: { error: "Too many login attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: { error: "Too many requests. Please slow down." },
});
```

2. Apply to routes in `server/src/app.ts`:
```typescript
import { authLimiter, apiLimiter } from "./middleware/rateLimiter";

// Before auth routes
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/forgot-password", authLimiter);

// General API rate limit (optional)
app.use("/api", apiLimiter);
```

3. Test that rate limiting works:
   - Make 6 login attempts rapidly
   - Verify 429 response on 6th attempt

---

## Completed Fixes

- [x] **Issue #3:** Removed scraper auto-run on startup (`app.ts:17`)
- [x] **Issue #4:** Restricted CORS to CLIENT_URL
- [x] **Issue #21:** Renamed `useDebonce.ts` to `useDebounce.ts`
