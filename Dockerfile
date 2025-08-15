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

# Copy root package files
COPY package*.json ./

# Install root dependencies
RUN npm ci

# Copy server package files and install dependencies (including devDependencies for build)
COPY server/package*.json ./server/
RUN cd server && npm ci

# Copy client package files and install dependencies (including devDependencies for build)
COPY client/package*.json ./client/
RUN cd client && npm ci

# Copy all source code
COPY . .

# Generate Prisma client
RUN cd server && npx prisma generate

# Build the server
RUN cd server && npm run build

# Build the client
RUN cd client && npm run build

# Copy client build to server's static directory (if needed)
# RUN cp -r client/dist server/dist/public

# Expose port
EXPOSE 3021

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

# Start the server
CMD ["npm", "start"]