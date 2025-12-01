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
COPY packages/frontend ./packages/frontend
COPY packages/shared ./packages/shared

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the frontend
RUN pnpm --filter @tambr/frontend build

# Stage 2: Runtime
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Install serve to run the production build
RUN npm install -g serve

# Copy built application from builder
COPY --from=builder /app/packages/frontend/.next ./packages/frontend/.next
COPY --from=builder /app/packages/frontend/public ./packages/frontend/public
COPY --from=builder /app/packages/frontend/package.json ./packages/frontend/package.json

# Expose port
EXPOSE 3000

# Set working directory
WORKDIR /app/packages/frontend

# Start the application
CMD ["npm", "start"]
