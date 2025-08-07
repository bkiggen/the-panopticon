FROM node:18-alpine

WORKDIR /app

# Copy package.json files first (for better Docker layer caching)
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install dependencies
RUN cd server && npm ci
RUN cd client && npm ci

# Copy ALL source code (this was missing before the build step)
COPY . .

# Build client (now that source code is available)
RUN cd client && npm run build

# Build server
RUN cd server && npm run build

# Expose port
EXPOSE 3000

# Start server
WORKDIR /app/server
CMD ["npm", "start"]