# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package lock and json
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Set production env for build
ENV NODE_ENV=production
RUN npm run build

# Production runner stage using lightweight serve
FROM node:20-alpine AS runner

WORKDIR /app

# Install static file server
RUN npm install -g serve

# Copy built static assets from builder
COPY --from=builder /app/build ./build

# Expose admin port
EXPOSE 3001

# Run static server on port 3001
CMD ["serve", "-s", "build", "-l", "3001"]
