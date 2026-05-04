# ── Stage 1: deps ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ── Stage 2: builder (lint + test in CI — skipped in local dev) ───────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY src ./src
COPY .env.example ./.env.example

# ── Stage 3: production ────────────────────────────────────────────────────────
FROM node:20-alpine AS production
LABEL org.opencontainers.image.title="ecotrack-api" \
      org.opencontainers.image.description="EcoTrack REST API — production image" \
      org.opencontainers.image.version="2.0.0" \
      org.opencontainers.image.source="https://gitlab.com/ecotrack/ecotrack-api"

# Security: non-root user
RUN addgroup -S ecotrack && adduser -S ecotrack -G ecotrack

WORKDIR /app

# Copy only production deps from stage 1
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY package.json ./

# Ownership
RUN chown -R ecotrack:ecotrack /app

USER ecotrack

ENV NODE_ENV=production \
    PORT=3000

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost:3000/health/live || exit 1

CMD ["node", "src/server.js"]
