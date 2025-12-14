# --- Build Stage ---
FROM node:18-alpine AS build

RUN apk add --no-cache bash openssl

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

# Générer Prisma Client et appliquer migrations
RUN npm run setup

# Build Remix
RUN npm run build

# --- Production Stage ---
FROM node:18-alpine AS production

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY --from=build /app/build ./build
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules ./node_modules

EXPOSE 3000
ENV NODE_ENV=production

CMD ["npm", "run", "docker-start"]
