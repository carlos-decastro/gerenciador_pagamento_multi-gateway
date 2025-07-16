# Use Node.js 18 Alpine as base image
FROM node:18-alpine

# Install netcat for health checks and mysql client for database creation
RUN apk add --no-cache netcat-openbsd mysql-client

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Copy and make entrypoint script executable
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Build the application
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm prune --production

# Expose port
EXPOSE 3333

# Set working directory to build output
WORKDIR /app/build

# Use entrypoint script
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]