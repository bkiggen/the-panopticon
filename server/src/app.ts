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

console.log(`🔍 NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`📂 Current working directory: ${process.cwd()}`);
console.log(`📂 __dirname: ${__dirname}`);

const fs = require("fs");
try {
  console.log(`📋 Root contents:`, fs.readdirSync("./"));
  if (fs.existsSync("./client")) {
    console.log(`📋 Client dir exists, contents:`, fs.readdirSync("./client"));
    if (fs.existsSync("./client/dist")) {
      console.log(`📋 Client/dist contents:`, fs.readdirSync("./client/dist"));
    }
  }
} catch (error) {
  console.error(`❌ Error checking directories:`, error);
}

if (process.env.NODE_ENV === "production") {
  const fs = require("fs");
  const staticPath = path.join(__dirname, "../../client/dist");

  console.log(`📁 Static path resolved to: ${staticPath}`);
  console.log(`📂 Current working directory: ${process.cwd()}`);
  console.log(`📂 __dirname: ${__dirname}`);

  // Check what's actually in the current directory structure
  try {
    console.log(
      `📋 Root contents:`,
      fs.readdirSync(path.join(__dirname, "../.."))
    );

    if (fs.existsSync(path.join(__dirname, "../../client"))) {
      console.log(
        `📋 Client dir contents:`,
        fs.readdirSync(path.join(__dirname, "../../client"))
      );

      if (fs.existsSync(staticPath)) {
        console.log(`✅ Static directory exists at: ${staticPath}`);
        console.log(`📋 Static dir contents:`, fs.readdirSync(staticPath));
      } else {
        console.log(`❌ Static directory does not exist at: ${staticPath}`);
      }
    } else {
      console.log(`❌ Client directory does not exist`);
    }
  } catch (error) {
    console.error(`❌ Error checking directories:`, error);
  }

  // Serve static files from React build
  app.use(express.static(staticPath));

  // More specific catch-all - exclude API routes
  app.get(/^(?!\/api).*$/, (req, res) => {
    const indexPath = path.join(staticPath, "index.html");
    console.log(`📄 Attempting to serve index.html from: ${indexPath}`);

    if (fs.existsSync(indexPath)) {
      console.log(`✅ index.html found, serving...`);
      res.sendFile(indexPath);
    } else {
      console.log(`❌ index.html not found at: ${indexPath}`);
      res.status(404).send("Static files not found");
    }
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
