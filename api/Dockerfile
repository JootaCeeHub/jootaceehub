FROM node:22-alpine AS build
WORKDIR /app

# Install dependencies (including devDeps for tsc)
COPY package*.json ./
RUN npm ci

# Build TypeScript
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ── Runtime stage ──────────────────────────────────────────────────────────
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

# Copy compiled output
COPY --from=build /app/dist ./dist

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Non-root user for security
RUN addgroup -S api && adduser -S api -G api
USER api

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3001/health || exit 1

CMD ["node", "dist/index.js"]
