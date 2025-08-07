# Use Node.js LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files for both client and server
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install server dependencies
WORKDIR /app/server
RUN npm ci --only=production

# Install client dependencies and build
WORKDIR /app/client
RUN npm ci
RUN npm run build

# Copy all source files
WORKDIR /app
COPY . .

# Build server
WORKDIR /app/server
RUN npm run build

# Expose port
EXPOSE 3000

# Start the server
CMD ["npm", "start"]