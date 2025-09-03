import "./paths";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { PrismaClient } from "@prisma/client";
import { initializeCronJobs } from "./services/cronService";
import movieEventRoutes from "./routes/movieEvents";
import adminRoutes from "./routes/admin";
import authRoutes from "./routes/authRoutes";
import { runTomorrowTheaterScraper } from "./cron/scrapers/tomorrow";

dotenv.config();

initializeCronJobs();

runTomorrowTheaterScraper();

const app = express();
const prisma = new PrismaClient();
const PORT = parseInt(process.env.PORT || "3000", 10);

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
        ],
      },
    },
  })
);
app.use(cors());
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// API routes
app.use("/api/movie-events", movieEventRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);

// Debug logging
console.log(`🔍 NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`📂 Current working directory: ${process.cwd()}`);
console.log(`📂 __dirname: ${__dirname}`);

try {
  console.log(`📋 Root contents:`, fs.readdirSync("./"));
  if (fs.existsSync("./client-build")) {
    console.log(
      `📋 Client-build dir exists, contents:`,
      fs.readdirSync("./client-build")
    );
  } else {
    console.log(`❌ Client-build directory does not exist`);
  }
} catch (error) {
  console.error(`❌ Error checking directories:`, error);
}

// Production static file serving
if (process.env.NODE_ENV === "production") {
  const staticPath = path.join(__dirname, "../client-build");
  console.log(`📁 Static path: ${staticPath}`);

  try {
    if (fs.existsSync(staticPath)) {
      console.log(`✅ Static directory exists at: ${staticPath}`);
      console.log(`📋 Static dir contents:`, fs.readdirSync(staticPath));

      // Serve static files from React build
      app.use(express.static(staticPath));

      // Catch-all handler for client-side routing - exclude API routes
      app.get(/^(?!\/api).*$/, (req, res) => {
        const indexPath = path.join(staticPath, "index.html");
        console.log(`📄 Serving index.html from: ${indexPath}`);
        res.sendFile(indexPath);
      });
    } else {
      console.log(`❌ Static directory does not exist at: ${staticPath}`);

      // Fallback route if static files aren't found
      app.get("/", (req, res) => {
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

export { prisma };
