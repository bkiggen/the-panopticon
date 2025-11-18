# The Panopticon

A movie theater event aggregation platform for Portland, Oregon's independent cinema scene. Panopticon scrapes showtimes from local theaters, enriches them with metadata, and presents them through an intuitive web interface with admin controls.

## Overview

Panopticon helps movie lovers discover what's playing at Portland's independent theaters:
- **Academy Theater**
- **Cinema 21**
- **Laurelhurst Theater**
- **Tomorrow Theater**
- **Hollywood Theater**
- **Clinton Street Theater**
- **Cinemagic**
- **Living Room Theaters**
- And more...

## Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for blazing-fast builds
- **Material-UI v7** for UI components
- **Zustand** for state management
- **React Router v7** for routing
- **React Hook Form + Yup** for forms

### Backend
- **Node.js + Express**
- **Prisma ORM** with PostgreSQL
- **JWT** authentication
- **Puppeteer** for web scraping
- **OMDB API** for movie metadata

## Quick Start

### Prerequisites
- Node.js 18+
- Docker Desktop (for PostgreSQL)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd panopticon
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install client dependencies
cd client && npm install

# Install server dependencies
cd ../server && npm install
```

3. **Set up environment variables**

**Client** (`client/.env`):
```bash
VITE_API_URL=http://localhost:3021/api
```

**Server** (`server/.env`):
```bash
DATABASE_URL="postgresql://devuser:devpassword@localhost:5432/panopticon"
PORT=3021
NODE_ENV=development
OMDB_API_KEY=your_api_key_here
JWT_SECRET=your_secret_here
JWT_EXPIRES_IN=1d

# Admin user for seeding
ADMIN_EMAIL=admin@panopticon.local
ADMIN_PASSWORD=admin123
ADMIN_NAME=Admin User
```

4. **Start PostgreSQL**
```bash
cd server
docker-compose up -d
```

5. **Run database migrations**
```bash
cd server
npx prisma migrate dev
```

6. **Create admin user**
```bash
cd server
node create-admin.js
```

7. **Start the servers**

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

8. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3021/api
- Admin login: Use credentials from step 6

## Project Structure

```
panopticon/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API client layer
│   │   ├── stores/        # Zustand state stores
│   │   ├── lib/           # Constants (theaters, genres, formats)
│   │   ├── utils/         # Utility functions
│   │   ├── hooks/         # Custom React hooks
│   │   ├── routing/       # Route definitions
│   │   └── types/         # TypeScript types
│   └── public/            # Static assets
└── server/                # Node.js backend
    ├── src/
    │   ├── routes/        # Express routes
    │   ├── controllers/   # Request handlers
    │   ├── services/      # Business logic
    │   ├── middleware/    # Auth, validation, etc.
    │   ├── cron/          # Scrapers and scheduled jobs
    │   └── types/         # TypeScript types
    └── prisma/            # Database schema and migrations
```

## Features

### Public Features
- Browse movie events by date, theater, format, and genre
- Filter by accessibility features (captions, audio description)
- Search movies by title
- View detailed movie information with trailers
- Responsive design (mobile + desktop)
- Dark/light theme support

### Admin Features
- Manage movie events (create, edit, delete)
- Manage movie metadata
- Trigger scraping for specific theaters
- Bulk upload events from JSON
- View and filter all data

## Available Scripts

### Client
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Server
```bash
npm run dev           # Start with nodemon (hot reload)
npm run build         # Compile TypeScript
npm start             # Run production server
npx prisma studio     # Open Prisma Studio (DB GUI)
npx prisma migrate dev  # Run migrations
```

## API Documentation

See [API.md](./docs/API.md) for complete API reference.

## Architecture

See [ARCHITECTURE.md](./docs/ARCHITECTURE.md) for architectural details.

## Development Guide

See [DEVELOPMENT.md](./docs/DEVELOPMENT.md) for development best practices.

## Contributing

See [IMPROVEMENTS.md](./docs/IMPROVEMENTS.md) for areas that need work.

## License

[Add your license here]

## Support

For issues and questions, please use the GitHub issue tracker.
