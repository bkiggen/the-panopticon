# THE PANOPTICON - Frontend

This is the React frontend for Panopticon, a movie theater event aggregator.

## Documentation

**For complete documentation, see the main project README and docs:**

- **[Main README](../README.md)** - Project overview and quick start
- **[Architecture](../docs/ARCHITECTURE.md)** - System architecture and design
- **[API Reference](../docs/API.md)** - Complete API documentation
- **[Development Guide](../docs/DEVELOPMENT.md)** - Best practices and patterns
- **[Improvements](../docs/IMPROVEMENTS.md)** - Technical debt and enhancement ideas
- **[Claude Guide](../docs/CLAUDE_GUIDE.md)** - Quick reference for AI assistants

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Tech Stack

- React 19 + TypeScript
- Vite (build tool)
- Material-UI v7
- Zustand (state management)
- React Router v7
- React Hook Form + Yup

## Project Structure

```
src/
├── components/    # Reusable UI components
├── pages/        # Route pages (MovieEvents, Admin, Auth)
├── services/     # API client functions
├── stores/       # Zustand state stores
├── lib/          # Constants (theaters, genres, formats)
├── utils/        # Utility functions
├── hooks/        # Custom React hooks
├── routing/      # Route definitions
└── types/        # TypeScript types
```

## Environment Variables

Create a `.env` file:

```bash
VITE_API_URL=http://localhost:3021/api
```

## Available Scripts

- `npm run dev` - Start development server on http://localhost:5173
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Learn More

See the [Development Guide](../docs/DEVELOPMENT.md) for detailed information on patterns, conventions, and best practices.
