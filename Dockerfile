# --- Build Stage ---
FROM node:20-alpine AS build  # ⬅️ CHANGÉ : Node 18 → 20 (nécessaire pour Shopify Polaris)

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
FROM node:20-alpine AS production  # ⬅️ CHANGÉ : Node 18 → 20

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY --from=build /app/build ./build
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules ./node_modules

EXPOSE 3000
ENV NODE_ENV=production

# ⬇️ AJOUTER CETTE LIGNE OBLIGATOIRE ⬇️
CMD ["node", "build/server/index.js"]  # ✅ Commande pour démarrer l'application
