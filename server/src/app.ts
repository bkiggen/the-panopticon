import "./paths";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { prisma } from "./lib/prisma";
import { initializeCronJobs } from "./services/cronService";
import { authLimiter } from "./middleware/rateLimiter";
import movieEventRoutes from "./routes/movieEvents";
import adminRoutes from "./routes/admin";
import authRoutes from "./routes/authRoutes";

dotenv.config();

// Create Express app
export function createApp() {
  const app = express();

  // Middleware
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          ...helmet.contentSecurityPolicy.getDefaultDirectives(),
          "img-src": [
            "'self'",
            "data:",
            "https://img.vwassets.com",
            "https://m.media-amazon.com",
            "https://hollywoodtheatre.org",
            "https://www.laurelhurst.com",
            "https://www.laurelhursttheater.com",
            "https://ticketing.useast.veezi.com",
            "https://pdx.livingroomtheaters.com",
          ],
        },
      },
    })
  );
  app.use(
    cors({
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    })
  );

  // Skip morgan logging in test environment
  if (process.env.NODE_ENV !== "test") {
    app.use(morgan("combined"));
  }

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check route
  app.get("/health", (_req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
  });

  // API routes
  app.use("/api/movie-events", movieEventRoutes);

  // Allow CORS for manual scrape endpoint (called from external sites)
  app.options("/api/admin/manual-scrape", cors({ origin: true, credentials: false }));
  app.use("/api/admin/manual-scrape", cors({ origin: true, credentials: false }));

  app.use("/api/admin", adminRoutes);

  // Rate limiting for auth routes (authLimiter handles test skipping internally)
  app.use("/api/auth/login", authLimiter);
  app.use("/api/auth/forgot-password", authLimiter);
  app.use("/api/auth/reset-password", authLimiter);
  app.use("/api/auth", authRoutes);

  // Production static file serving
  if (process.env.NODE_ENV === "production") {
    const staticPath = path.join(__dirname, "../client-build");

    try {
      if (fs.existsSync(staticPath)) {
        // Serve static files from React build
        app.use(express.static(staticPath));

        // Catch-all handler for client-side routing - exclude API routes
        app.get(/^(?!\/api).*$/, (_req, res) => {
          const indexPath = path.join(staticPath, "index.html");
          res.sendFile(indexPath);
        });
      } else {
        // Fallback route if static files aren't found
        app.get("/", (_req, res) => {
          res.send(`
            <html>
              <body>
                <h1>Server is running!</h1>
                <p>Static files not found. Check deployment.</p>
                <p>API available at: <a href="/api/movie-events">/api/movie-events</a></p>
                <p>Health check: <a href="/health">/health</a></p>
              </body>
            </html>
          `);
        });
      }
    } catch (error) {
      console.error(`❌ Error setting up static files:`, error);
    }
  }

  return app;
}

// Only start server if this file is run directly (not imported for tests)
if (process.env.NODE_ENV !== "test") {
  initializeCronJobs();

  const app = createApp();
  const PORT = parseInt(process.env.PORT || "3021", 10);

  // Graceful shutdown
  process.on("SIGINT", async () => {
    await prisma.$disconnect();
    process.exit(0);
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
    console.log(`📊 Health check: http://0.0.0.0:${PORT}/health`);
    console.log(`🎬 Movie events: http://0.0.0.0:${PORT}/api/movie-events`);
  });
}

export { prisma };
