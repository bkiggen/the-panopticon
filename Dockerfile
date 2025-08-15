# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Install necessary system dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Set Puppeteer to use installed Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Set working directory
WORKDIR /app

# Copy root package files
COPY package*.json ./

# Install root dependencies
RUN npm ci

# Copy server package files and install dependencies
COPY server/package*.json ./server/
RUN cd server && npm ci

# Copy client package files and install dependencies
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