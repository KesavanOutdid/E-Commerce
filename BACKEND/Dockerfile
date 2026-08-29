FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install curl for healthchecks
RUN apk add --no-cache curl

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy application source code
COPY . .

# Create uploads and logs directories if they do not exist
RUN mkdir -p uploads logs

# Expose backend port
EXPOSE 5000

# Environment defaults
ENV PORT=5000
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Start the Node.js application
CMD ["node", "server.js"]
