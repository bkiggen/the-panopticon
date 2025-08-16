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

# Copy and build client first
COPY client/package*.json ./client/
RUN cd client && npm ci

COPY client/ ./client/
# Build client with environment variables available
ARG VITE_AUTH_CODE
ARG VITE_API_URL
ENV VITE_AUTH_CODE=$VITE_AUTH_CODE
ENV VITE_API_URL=$VITE_API_URL
RUN cd client && npm run build

# Copy and build server
COPY server/package*.json ./server/
RUN cd server && npm ci

COPY server/ ./server/
RUN cd server && npx prisma generate && npm run build

# Copy client build files to where server can access them
# Since server runs from /app/server, we need client files accessible from there
RUN mkdir -p server/client-build && cp -r client/dist/* server/client-build/

# Copy the root package.json for the start script
COPY package.json ./

# Verify the structure
RUN echo "=== FINAL STRUCTURE CHECK ===" && \
    echo "Server directory:" && ls -la server/ && \
    echo "Client build in server:" && ls -la server/client-build/

# Run database migrations on startup (not during build)
# We'll do this in the start command instead

# Expose port
EXPOSE 3021

# Start the server
CMD ["npm", "start"]