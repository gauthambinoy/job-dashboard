# ──────────────────────────────────────────────
# Stage 1: Install dependencies and build
# ──────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Accept the public API URL at build time so Next.js can inline it
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Disable telemetry during the build
ENV NEXT_TELEMETRY_DISABLED=1

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

# ──────────────────────────────────────────────
# Stage 2: Lean production image using standalone output
# ──────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Non-root user for security hardening
RUN addgroup -g 1001 -S nodejs && \
    adduser  -S nodejs -u 1001 -G nodejs

# Copy only what Next.js standalone output requires
COPY --from=builder --chown=nodejs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nodejs:nodejs /app/.next/static   ./.next/static
COPY --from=builder --chown=nodejs:nodejs /app/public         ./public

USER nodejs

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000 || exit 1

# next start is not used; standalone bundles its own minimal server.js
CMD ["node", "server.js"]
