# ─────────────────────────────────────────────────────────────────
# Eventify Backend — Dockerfile
# Multi-stage build: lean production image
# ─────────────────────────────────────────────────────────────────

# ── Stage 1: Dependencies ────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package files only (layer cache optimization)
COPY package.json package-lock.json ./
RUN npm ci --only=production --ignore-scripts

# ── Stage 2: Production Image ────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# Security: run as non-root user
RUN addgroup --system eventify && \
    adduser --system --ingroup eventify eventify

# Copy production deps from stage 1
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY --chown=eventify:eventify . .

# Create uploads directory (used in dev; in prod Cloudinary replaces this)
RUN mkdir -p uploads && chown eventify:eventify uploads

# Switch to non-root user
USER eventify

EXPOSE 5000

# Healthcheck — Docker will restart container if this fails
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:5000/health || exit 1

CMD ["node", "server.js"]
