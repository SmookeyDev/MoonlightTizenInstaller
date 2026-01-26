FROM node:20-alpine

WORKDIR /app

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++ git

# Copy package files first for better caching
COPY client/services/tizenbrew-installer-service/package*.json ./client/services/tizenbrew-installer-service/
COPY client/ui/package*.json ./client/ui/

# Install service dependencies
WORKDIR /app/client/services/tizenbrew-installer-service
RUN npm install

# Install UI dependencies
WORKDIR /app/client/ui
RUN npm install --force

# Copy all source files
WORKDIR /app
COPY client/ ./client/

# Build UI
WORKDIR /app/client/ui
RUN npm run build

# Setup runtime
WORKDIR /app/client/services/tizenbrew-installer-service

# Create volume for config persistence
VOLUME ["/root/share"]

# Expose service ports
EXPOSE 8091 4794

# Run the service
CMD ["node", "."]
