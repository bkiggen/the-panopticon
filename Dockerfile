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

# Copy package files for workspace resolution
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install all dependencies from root (this handles workspaces properly)
RUN npm install

# Copy all source code
COPY . .

# Generate Prisma client first
RUN cd server && npx prisma generate

# Debug: List client directory contents and check node_modules
RUN echo "=== CLIENT DIRECTORY CONTENTS ===" && \
    ls -la client/ && \
    echo "=== CLIENT NODE_MODULES ===" && \
    ls -la client/node_modules/ | head -20 && \
    echo "=== CHECKING VITE ===" && \
    which vite || echo "vite not found globally" && \
    cd client && npx vite --version && \
    echo "=== CHECKING ROLLUP ===" && \
    cd client && npm ls rollup

# Build the server
RUN cd server && npm run build

# Build the client with detailed error output
RUN cd client && npm run build 2>&1

# Copy client build to server's static directory (if needed)
# RUN cp -r client/dist server/dist/public

# Expose port
EXPOSE 3021

# Start the server
CMD ["npm", "start"]