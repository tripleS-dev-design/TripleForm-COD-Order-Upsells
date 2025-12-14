FROM node:20-alpine

# Needed by Shopify + Prisma
RUN apk add --no-cache openssl

EXPOSE 3000

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0

# Copy deps
COPY package.json package-lock.json* ./

# Install prod deps only
RUN npm ci --omit=dev && npm cache clean --force

# Remove Shopify CLI (ما محتاجاهش ف prod)
RUN npm remove @shopify/cli

# Copy app source
COPY . .

# Build Remix
RUN npm run build

# Prisma migrate + start server
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
