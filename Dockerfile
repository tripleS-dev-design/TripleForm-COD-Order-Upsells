FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app
EXPOSE 3000

ENV NODE_ENV=production

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && npm cache clean --force
RUN npm remove @shopify/cli

COPY . .

# Prisma client
RUN npx prisma generate

# Build Remix (production)
RUN npm run build


# ✅ Node مباشرة
CMD ["sh", "-c", "npx prisma migrate deploy && node build/server/index.js"]
