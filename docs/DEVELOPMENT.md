# Development Guide

Best practices, patterns, and conventions for developing Panopticon.

## Getting Started

### First Time Setup

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd panopticon
npm install
cd client && npm install
cd ../server && npm install
```

2. **Set up environment variables** (see README.md)

3. **Start PostgreSQL:**
```bash
cd server
docker-compose up -d
```

4. **Run migrations:**
```bash
cd server
npx prisma migrate dev
```

5. **Seed database:**
```bash
cd server
node create-admin.js
```

6. **Start development servers:**

Terminal 1:
```bash
cd server
npm run dev
```

Terminal 2:
```bash
cd client
npm run dev
```

---

## Project Structure

### Frontend (client/)

```
client/src/
├── components/      # Reusable UI components
├── pages/          # Page-level components (one per route)
├── services/       # API client functions
├── stores/         # Zustand state management
├── lib/            # Constants and configuration
├── utils/          # Pure utility functions
├── hooks/          # Custom React hooks
├── routing/        # Route definitions
└── types/          # TypeScript type definitions
```

### Backend (server/)

```
server/src/
├── routes/         # Express route handlers
├── controllers/    # Business logic
├── services/       # External integrations (OMDB, etc.)
├── middleware/     # Auth, validation, etc.
├── cron/           # Scrapers and scheduled jobs
├── types/          # TypeScript types
└── app.ts          # Main application entry
```

---

## Code Style & Conventions

### TypeScript

**Use strict typing:**
```typescript
// ✅ Good
interface User {
  id: string;
  email: string;
  isAdmin: boolean;
}

const createUser = (data: Omit<User, 'id'>): User => { ... }

// ❌ Bad
const createUser = (data: any): any => { ... }
```

**Prefer interfaces over types for objects:**
```typescript
// ✅ Good
interface MovieEvent {
  id: number;
  title: string;
}

// ⚠️ Use type for unions/intersections
type Format = "Digital" | "35mm" | "70mm";
```

**Use enums for constants:**
```typescript
// ✅ Good
enum UserRole {
  Admin = "admin",
  User = "user"
}

// ❌ Avoid
const ADMIN = "admin";
const USER = "user";
```

### Naming Conventions

**Files:**
- Components: PascalCase (e.g., `MovieEventCard.tsx`)
- Utilities: camelCase (e.g., `formatDate.ts`)
- Constants: UPPER_SNAKE_CASE (e.g., `API_CONFIG.ts`)

**Variables:**
- camelCase for variables and functions
- PascalCase for components and classes
- UPPER_SNAKE_CASE for constants

**Functions:**
```typescript
// ✅ Good - descriptive names
const fetchMovieEvents = async () => { ... }
const formatShowtime = (time: string) => { ... }

// ❌ Bad - unclear names
const get = async () => { ... }
const format = (x: string) => { ... }
```

**Components:**
```typescript
// ✅ Good - noun-based names
<MovieEventCard />
<FilterDropdown />
<AdminLayout />

// ❌ Bad - verb-based or unclear
<ShowMovie />
<Thing />
```

### React Patterns

**Functional Components with Hooks:**
```typescript
// ✅ Good
export const MovieEventCard: React.FC<{ event: MovieEvent }> = ({ event }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card>
      {/* ... */}
    </Card>
  );
};

// ❌ Avoid class components
class MovieEventCard extends React.Component { ... }
```

**Custom Hooks:**
```typescript
// hooks/useMovieEvents.ts
export const useMovieEvents = (filters: Filters) => {
  const [events, setEvents] = useState<MovieEvent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const data = await movieEventService.getMovieEvents(filters);
      setEvents(data.events);
      setLoading(false);
    };

    fetchEvents();
  }, [filters]);

  return { events, loading };
};
```

**Props Destructuring:**
```typescript
// ✅ Good
export const MovieEventCard: React.FC<MovieEventCardProps> = ({
  event,
  onEdit,
  onDelete
}) => { ... }

// ❌ Bad
export const MovieEventCard = (props) => {
  return <div>{props.event.title}</div>
}
```

### State Management (Zustand)

**Store Structure:**
```typescript
// stores/exampleStore.ts
interface ExampleStore {
  // State
  items: Item[];
  loading: boolean;
  error: string | null;

  // Computed getters
  itemCount: () => number;

  // Sync actions
  setItems: (items: Item[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Async thunks
  fetchItems: (filters?: Filters) => Promise<void>;
  createItem: (data: CreateItemData) => Promise<void>;
}

export const useExampleStore = create<ExampleStore>((set, get) => ({
  // Initial state
  items: [],
  loading: false,
  error: null,

  // Computed
  itemCount: () => get().items.length,

  // Sync actions
  setItems: (items) => set({ items }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // Async thunks
  fetchItems: async (filters) => {
    set({ loading: true, error: null });
    try {
      const data = await api.getItems(filters);
      set({ items: data.items, loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      set({ error: message, loading: false });
    }
  },

  createItem: async (data) => {
    set({ loading: true, error: null });
    try {
      const newItem = await api.createItem(data);
      set(state => ({
        items: [...state.items, newItem],
        loading: false
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      set({ error: message, loading: false });
    }
  }
}));
```

**Usage in Components:**
```typescript
export const ItemList = () => {
  const { items, loading, fetchItems } = useExampleStore();

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  if (loading) return <CircularProgress />;

  return (
    <List>
      {items.map(item => (
        <ListItem key={item.id}>{item.name}</ListItem>
      ))}
    </List>
  );
};
```

### Forms with React Hook Form

**Pattern:**
```typescript
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object().shape({
  title: yup.string().required('Title is required'),
  date: yup.date().required('Date is required'),
  times: yup.array().of(yup.string()).min(1, 'At least one time required')
});

interface FormData {
  title: string;
  date: Date;
  times: string[];
}

export const EventForm = () => {
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      date: new Date(),
      times: []
    }
  });

  const onSubmit = async (data: FormData) => {
    await createEvent(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="title"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Title"
            error={!!errors.title}
            helperText={errors.title?.message}
          />
        )}
      />
      {/* More fields */}
      <Button type="submit">Submit</Button>
    </form>
  );
};
```

### API Service Pattern

**Service Structure:**
```typescript
// services/exampleService.ts
import { API_CONFIG } from './api/config';

const BASE_URL = API_CONFIG.BASE_URL;

export const exampleService = {
  getItems: async (filters?: Filters): Promise<ItemResponse> => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);

    const response = await fetch(`${BASE_URL}/items?${params}`);

    if (!response.ok) {
      throw new Error('Failed to fetch items');
    }

    return response.json();
  },

  createItem: async (data: CreateItemData): Promise<Item> => {
    const response = await fetch(`${BASE_URL}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to create item');
    }

    return response.json();
  }
};
```

**Authenticated Requests:**
```typescript
// services/api/client.ts
export const authenticatedFetch = async (
  url: string,
  options?: RequestInit
): Promise<any> => {
  const token = localStorage.getItem(API_CONFIG.STORAGE_KEYS.AUTH_TOKEN);

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options?.headers,
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `${API_CONFIG.AUTH.TOKEN_PREFIX} ${token}` })
    }
  });

  if (response.status === 401) {
    // Handle unauthorized (logout, redirect, etc.)
    localStorage.removeItem(API_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    window.location.href = '/auth';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
};
```

---

## Backend Development

### Express Route Structure

```typescript
// routes/items.ts
import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import * as itemController from '../controllers/itemController';

const router = Router();

// Public routes
router.get('/', itemController.getItems);
router.get('/:id', itemController.getItemById);

// Protected routes (require authentication)
router.post('/', authenticateToken, itemController.createItem);
router.put('/:id', authenticateToken, itemController.updateItem);
router.delete('/:id', authenticateToken, itemController.deleteItem);

export default router;
```

### Controller Pattern

```typescript
// controllers/itemController.ts
import { Request, Response } from 'express';
import { prisma } from '../app';

export const getItems = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50, search } = req.query;

    const where = search
      ? { title: { contains: String(search), mode: 'insensitive' } }
      : {};

    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.item.count({ where })
    ]);

    res.json({
      items,
      total,
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createItem = async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;

    // Validation
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const item = await prisma.item.create({
      data: { title, description }
    });

    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
```

### Database Queries (Prisma)

**Best Practices:**

```typescript
// ✅ Good - Select only needed fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    name: true
  }
});

// ❌ Bad - Fetches all fields including passwords
const users = await prisma.user.findMany();

// ✅ Good - Use transactions for multiple operations
await prisma.$transaction([
  prisma.movieEvent.create({ data: eventData }),
  prisma.movieData.update({ where: { id }, data: movieData })
]);

// ❌ Bad - Separate operations (no atomicity)
await prisma.movieEvent.create({ data: eventData });
await prisma.movieData.update({ where: { id }, data: movieData });

// ✅ Good - Include relations when needed
const events = await prisma.movieEvent.findMany({
  include: {
    movieData: {
      select: {
        id: true,
        title: true,
        genres: true
      }
    }
  }
});
```

---

## Testing

### Frontend Testing

**Component Tests:**
```typescript
// components/MovieEventCard/__tests__/MovieEventCard.test.tsx
import { render, screen } from '@testing-library/react';
import { MovieEventCard } from '../index';

describe('MovieEventCard', () => {
  const mockEvent = {
    id: 1,
    title: 'The Matrix',
    date: '2024-01-15',
    times: ['7:00pm'],
    theatre: 'Cinema 21',
    format: '35mm'
  };

  it('renders event title', () => {
    render(<MovieEventCard event={mockEvent} />);
    expect(screen.getByText('The Matrix')).toBeInTheDocument();
  });

  it('displays showtimes', () => {
    render(<MovieEventCard event={mockEvent} />);
    expect(screen.getByText('7:00pm')).toBeInTheDocument();
  });
});
```

**Store Tests:**
```typescript
// stores/__tests__/movieEventStore.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useMovieEventStore } from '../movieEventStore';

describe('movieEventStore', () => {
  it('fetches events', async () => {
    const { result } = renderHook(() => useMovieEventStore());

    await act(async () => {
      await result.current.fetchEvents();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.events).toHaveLength(expect.any(Number));
  });
});
```

### Backend Testing

**API Tests:**
```typescript
// routes/__tests__/movieEvents.test.ts
import request from 'supertest';
import app from '../../app';

describe('GET /api/movie-events', () => {
  it('returns movie events', async () => {
    const response = await request(app)
      .get('/api/movie-events')
      .expect(200);

    expect(response.body).toHaveProperty('events');
    expect(response.body).toHaveProperty('total');
  });

  it('filters by theatre', async () => {
    const response = await request(app)
      .get('/api/movie-events?theatres=Cinema 21')
      .expect(200);

    expect(response.body.events.every(e => e.theatre === 'Cinema 21')).toBe(true);
  });
});

describe('POST /api/movie-events', () => {
  it('requires authentication', async () => {
    await request(app)
      .post('/api/movie-events')
      .send({ title: 'Test' })
      .expect(401);
  });

  it('creates event when authenticated', async () => {
    const token = 'valid-jwt-token'; // Get from login

    const response = await request(app)
      .post('/api/movie-events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'The Matrix',
        date: '2024-01-15',
        times: ['7:00pm'],
        theatre: 'Cinema 21',
        format: '35mm'
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
  });
});
```

---

## Git Workflow

### Branch Naming

```
feature/add-user-favorites
bugfix/fix-login-redirect
hotfix/security-patch
chore/update-dependencies
docs/api-documentation
```

### Commit Messages

Follow conventional commits:

```
feat: add user favorites feature
fix: resolve login redirect issue
docs: update API documentation
chore: upgrade dependencies
refactor: extract pagination logic
test: add tests for auth service
perf: optimize event queries
style: format code with prettier
```

**Examples:**
```bash
# ✅ Good
git commit -m "feat: add filter by accessibility features"
git commit -m "fix: resolve duplicate events from scraper"
git commit -m "docs: add DEVELOPMENT.md guide"

# ❌ Bad
git commit -m "updates"
git commit -m "fixed stuff"
git commit -m "WIP"
```

### Pull Request Process

1. Create feature branch from `main`
2. Make changes with descriptive commits
3. Write/update tests
4. Update documentation if needed
5. Create PR with description of changes
6. Request review
7. Address feedback
8. Merge when approved

---

## Database Migrations

### Creating Migrations

```bash
# After changing prisma/schema.prisma
npx prisma migrate dev --name add_user_favorites

# This will:
# 1. Create migration SQL file
# 2. Apply migration to database
# 3. Regenerate Prisma Client
```

### Migration Best Practices

1. **Always review generated SQL** before applying
2. **Test migrations** in development first
3. **Never delete old migrations** - they're your history
4. **Backup database** before migrating in production
5. **Use transactions** for complex migrations

**Example Migration:**
```sql
-- migrations/20240115_add_user_favorites/migration.sql
CREATE TABLE "UserFavorite" (
  "id" SERIAL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "movieEventId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  CONSTRAINT "UserFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id"),
  CONSTRAINT "UserFavorite_movieEventId_fkey" FOREIGN KEY ("movieEventId") REFERENCES "MovieEvent"("id")
);

CREATE UNIQUE INDEX "UserFavorite_userId_movieEventId_key"
  ON "UserFavorite"("userId", "movieEventId");
```

---

## Environment Variables

### Required Variables

**Client (.env):**
```bash
VITE_API_URL=http://localhost:3021/api
```

**Server (.env):**
```bash
DATABASE_URL="postgresql://user:pass@localhost:5432/panopticon"
PORT=3021
NODE_ENV=development
OMDB_API_KEY=your_key
JWT_SECRET=your_secret
JWT_EXPIRES_IN=24h
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=secure_password
ADMIN_NAME=Admin User
```

### Validation

Create a config validation service:

```typescript
// server/src/config/index.ts
import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  databaseUrl: string;
  jwtSecret: string;
  omdbApiKey: string;
}

const getConfig = (): Config => {
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
    'OMDB_API_KEY'
  ];

  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }

  return {
    port: parseInt(process.env.PORT || '3021'),
    nodeEnv: process.env.NODE_ENV || 'development',
    databaseUrl: process.env.DATABASE_URL!,
    jwtSecret: process.env.JWT_SECRET!,
    omdbApiKey: process.env.OMDB_API_KEY!
  };
};

export const config = getConfig();
```

---

## Debugging

### Frontend

**React DevTools:**
- Install React DevTools browser extension
- Use Components tab to inspect state
- Use Profiler to identify performance issues

**Zustand DevTools:**
```typescript
import { devtools } from 'zustand/middleware';

export const useMovieEventStore = create(
  devtools(
    (set, get) => ({
      // ... store implementation
    }),
    { name: 'MovieEventStore' }
  )
);
```

**Console Logging:**
```typescript
// ✅ Development only
if (import.meta.env.DEV) {
  console.log('Debug info:', data);
}

// ❌ Never in production
console.log('User token:', token);
```

### Backend

**VS Code Debugger:**
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Server",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "cwd": "${workspaceFolder}/server",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

**Prisma Query Logging:**
```typescript
// Enable query logging
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error']
});
```

---

## Performance Best Practices

### Frontend

1. **Lazy load routes:**
```typescript
const Admin = lazy(() => import('./pages/Admin'));
```

2. **Memoize expensive computations:**
```typescript
const sortedEvents = useMemo(
  () => events.sort((a, b) => a.date.localeCompare(b.date)),
  [events]
);
```

3. **Debounce user input:**
```typescript
const debouncedSearch = useDebounce(searchTerm, 500);
```

4. **Virtualize long lists:**
```typescript
// Use MUI DataGrid's built-in virtualization
<DataGrid rows={items} columns={columns} />
```

### Backend

1. **Use database indexes:**
```prisma
@@index([date, theatre])
```

2. **Select only needed fields:**
```typescript
prisma.user.findMany({ select: { id: true, email: true } });
```

3. **Batch database operations:**
```typescript
await prisma.movieEvent.createMany({ data: events });
```

4. **Cache frequently accessed data:**
```typescript
// Use Redis or in-memory cache
const cached = await cache.get(key);
if (cached) return cached;
```

---

## Security Checklist

- [ ] Environment variables not in version control
- [ ] Passwords hashed with bcrypt
- [ ] JWT tokens expire
- [ ] HTTPS in production
- [ ] CORS configured properly
- [ ] Input validation on all endpoints
- [ ] SQL injection protected (Prisma handles this)
- [ ] XSS protection (escape user input)
- [ ] Rate limiting on auth endpoints
- [ ] Error messages don't leak sensitive info
- [ ] Dependencies up to date
- [ ] Security headers (Helmet)

---

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zustand Guide](https://github.com/pmndrs/zustand)
- [Material-UI](https://mui.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Guide](https://expressjs.com)

---

## Getting Help

1. Check existing documentation (README, API, ARCHITECTURE)
2. Search GitHub issues
3. Ask in team chat
4. Create a detailed issue with:
   - What you're trying to do
   - What you've tried
   - Error messages
   - Environment details
