# ---------------------------
# Stage 1: Builder
# ---------------------------
FROM node:20-alpine AS builder

RUN apk add --no-cache bash openssl
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .

RUN npm run build

# ---------------------------
# Stage 2: Runner
# ---------------------------
FROM node:20-alpine AS runner

RUN apk add --no-cache bash openssl
WORKDIR /app
RUN mkdir -p /app/data

COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/remix.config.js ./remix.config.js

ENV NODE_ENV=production
ENV DATABASE_URL="file:/app/data/dev.sqlite"
ENV WEB_CONCURRENCY=1

# Run Prisma migrations at runtime
CMD npx prisma migrate deploy && node build/server/index.js
