FROM node:20-alpine

# Needed by Shopify + Prisma
RUN apk add --no-cache openssl

WORKDIR /app
EXPOSE 3000

ENV NODE_ENV=production


# Copy deps
COPY package.json package-lock.json* ./

# Install prod deps only
RUN npm ci --omit=dev && npm cache clean --force

# Remove Shopify CLI (ما محتاجاهش ف prod)
RUN npm remove @shopify/cli

# Copy app source
COPY . .

# ✅ Generate Prisma client (ضروري)
RUN npx prisma generate

# Build Remix
RUN npm run build

# Prisma migrate + start server
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
