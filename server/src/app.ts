import "./paths";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import { PrismaClient } from "@prisma/client";

// Import routes
import movieEventRoutes from "./routes/movieEvents";

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = parseInt(process.env.PORT || "3000", 10);

// Middleware
app.use(helmet());
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

if (process.env.NODE_ENV === "production") {
  const staticPath = path.join(__dirname, "../../client/dist");
  console.log(`📁 Looking for static files at: ${staticPath}`);

  // Check if the directory exists
  const fs = require("fs");
  if (fs.existsSync(staticPath)) {
    console.log(`✅ Static directory exists`);
    console.log(`📋 Contents:`, fs.readdirSync(staticPath));
  } else {
    console.log(`❌ Static directory does not exist`);
    console.log(`📋 Current directory contents:`, fs.readdirSync(__dirname));
  }

  // Serve static files from React build
  app.use(express.static(staticPath));

  // More specific catch-all - exclude API routes
  app.get(/^(?!\/api).*$/, (req, res) => {
    const indexPath = path.join(staticPath, "index.html");
    console.log(`📄 Serving index.html from: ${indexPath}`);
    res.sendFile(indexPath);
  });
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
