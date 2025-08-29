# Use Node.js 18 on Debian instead of Alpine to avoid Rollup musl issues
FROM node:18-slim

# Install necessary system dependencies including Chromium for Puppeteer
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libxss1 \
    libxtst6 \
    xdg-utils \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Set Puppeteer to use installed Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Set working directory
WORKDIR /app

# Copy root package files (for workspace management)
COPY package*.json ./

# Copy workspace package files
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install all dependencies from root (handles workspaces)
RUN npm install

# Copy source code
COPY client/ ./client/
COPY server/ ./server/

# Build client with environment variables available
ARG VITE_AUTH_CODE
ARG VITE_API_URL
ENV VITE_AUTH_CODE=$VITE_AUTH_CODE
ENV VITE_API_URL=$VITE_API_URL

# Build client using workspace-aware command
RUN npm run build:client

# Build server (generate Prisma client and compile TypeScript)
RUN npm run build:server

# Copy client build files to where server can access them
RUN mkdir -p server/client-build && cp -r client/dist/* server/client-build/

# Verify the structure
RUN echo "=== FINAL STRUCTURE CHECK ===" && \
    echo "Root directory:" && ls -la && \
    echo "Server directory:" && ls -la server/ && \
    echo "Client build in server:" && ls -la server/client-build/

# Expose port
EXPOSE 3021

# Start the server using workspace-aware command
CMD ["npm", "start"]