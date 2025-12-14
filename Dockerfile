# --- Build Stage ---
FROM node:20-alpine AS builder

RUN apk add --no-cache bash openssl
WORKDIR /app

# 1. Copy dependency files and install ALL (including dev dependencies)
COPY package.json package-lock.json* ./
RUN npm ci

# 2. Copy Prisma schema before generating client
COPY prisma ./prisma/
# 3. Copy the rest of the app and build
COPY . .
RUN npm run build

# --- Production Stage ---
FROM node:20-alpine AS runner

WORKDIR /app

# 1. Set up the database directory as root first
RUN mkdir -p /app/data && chown -R node:node /app/data

# 2. Switch to non-root user early for security
USER node

# 3. Copy only the built app and production node_modules from the builder stage
COPY --from=builder --chown=node:node /app/build ./build
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/package.json ./package.json

# 4. Set environment variable for the database
ENV DATABASE_URL="file:/app/data/dev.sqlite"

EXPOSE 3000
ENV NODE_ENV=production

CMD ["node", "build/server/index.js"]
