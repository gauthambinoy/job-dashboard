# ──────────────────────────────────────────────
# Stage 1: Build TypeScript → dist/
# ──────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy manifests first so layer is cached when source changes
COPY package*.json ./

# Install ALL deps (including devDependencies for tsc)
RUN npm ci

# Copy source and compile
COPY tsconfig.json ./
COPY src/ ./src/

RUN npm run build

# ──────────────────────────────────────────────
# Stage 2: Lean production image
# ──────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Install only production dependencies in the final layer
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Pull compiled output from the builder stage
COPY --from=builder /app/dist ./dist

# Non-root user for security hardening
RUN addgroup -g 1001 -S nodejs && \
    adduser  -S nodejs -u 1001 -G nodejs && \
    mkdir -p /app/.scraper_cache /app/.cache && \
    chown -R nodejs:nodejs /app/.scraper_cache /app/.cache

USER nodejs

ENV NODE_ENV=production

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:5000/health || exit 1

CMD ["node", "dist/index.js"]
