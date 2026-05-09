FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files. package-lock.json is optional in this repository.
COPY package*.json ./

# Install dependencies
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

# Copy source code
COPY . .

# Build Strapi admin panel
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache vips-dev

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app ./

# Create uploads directory
RUN mkdir -p public/uploads && \
    chown -R nodejs:nodejs public/uploads

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 1337

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:1337/_health || exit 1

# Run Strapi
CMD ["npm", "start"]
