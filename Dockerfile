# --- Étape 1 : base Node ---
FROM node:18-alpine AS base

# Installer openssl nécessaire pour certaines dépendances
RUN apk add --no-cache openssl

WORKDIR /app

# Copier uniquement les fichiers nécessaires pour installer les deps
COPY package.json package-lock.json* ./

# Installer toutes les dépendances (dev + prod) pour pouvoir faire prisma migrate
RUN npm ci

# --- Étape 2 : Build ---
FROM base AS build

WORKDIR /app

# Copier tout le code source
COPY . .

# Générer Prisma Client et appliquer les migrations
RUN npx prisma generate && npx prisma migrate deploy

# Build Remix pour la production
RUN npm run build

# --- Étape 3 : Production finale ---
FROM node:18-alpine AS production

WORKDIR /app

# Installer seulement les dépendances nécessaires pour la prod
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && npm cache clean --force

# Copier le build depuis l’étape précédente
COPY --from=build /app/build ./build
COPY --from=build /app/prisma ./prisma

# Exposer le port par défaut
EXPOSE 3000

# Définir NODE_ENV
ENV NODE_ENV=production

# Lancer Remix
CMD ["npx", "remix-serve", "build/server/index.js"]
