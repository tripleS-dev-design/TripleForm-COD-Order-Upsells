# ---------------------------
# Stage 1: Builder
# ---------------------------
FROM node:20-alpine AS builder

# Install dependencies
RUN apk add --no-cache bash openssl

# Set working directory
WORKDIR /app

# Copy package files and install
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy Prisma schema
COPY prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Run migrations (create tables including Session)
RUN npx prisma migrate deploy

# Copy all source code
COPY . .

# Build Remix app
RUN npm run build

# ---------------------------
# Stage 2: Runner
# ---------------------------
FROM node:20-alpine AS runner

# Install runtime dependencies
RUN apk add --no-cache bash openssl

# Set working directory
WORKDIR /app

# Create data folder (for SQLite persistence if needed)
RUN mkdir -p /app/data

# Copy build and node_modules from builder
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# Expose port
EXPOSE 3000

# Set NODE_ENV
ENV NODE_ENV=production
ENV WEB_CONCURRENCY=1

# Start the app
CMD ["node", "build/index.js"]
