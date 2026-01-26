FROM node:20-alpine

WORKDIR /app

# Install build dependencies and pnpm
RUN apk add --no-cache python3 make g++ git && \
    corepack enable && corepack prepare pnpm@9 --activate

# Copy package files first for better caching
COPY client/services/tizenbrew-installer-service/package.json ./client/services/tizenbrew-installer-service/
COPY client/ui/package.json ./client/ui/

# Install service dependencies
WORKDIR /app/client/services/tizenbrew-installer-service
RUN pnpm install

# Install UI dependencies
WORKDIR /app/client/ui
RUN pnpm install

# Copy all source files
WORKDIR /app
COPY client/ ./client/

# Build UI
WORKDIR /app/client/ui
RUN pnpm run build

# Setup runtime
WORKDIR /app/client/services/tizenbrew-installer-service

# Create volume for config persistence
VOLUME ["/root/share"]

# Expose service ports
EXPOSE 8091 4794

# Run the service
CMD ["node", "."]
