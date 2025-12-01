# Multi-stage build for optimized production image

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace files
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./

# Copy packages
COPY packages/relayer ./packages/relayer
COPY packages/shared ./packages/shared

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the relayer
RUN pnpm --filter @tambr/relayer build

# Stage 2: Runtime
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy built application from builder
COPY --from=builder /app/packages/relayer/dist ./packages/relayer/dist
COPY --from=builder /app/packages/relayer/package.json ./packages/relayer/package.json
COPY --from=builder /app/packages/relayer/node_modules ./packages/relayer/node_modules

# Expose port
EXPOSE 3001

# Set working directory
WORKDIR /app/packages/relayer

# Start the application
CMD ["node", "dist/main.js"]
