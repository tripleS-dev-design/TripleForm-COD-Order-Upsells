# --- Étape 1 : base Node ---
FROM node:18-alpine AS base

# Installer openssl et bash (souvent utile pour scripts npm)
RUN apk add --no-cache openssl bash

WORKDIR /app

# Copier uniquement package.json et package-lock.json pour installer deps
COPY package.json package-lock.json* ./

# Installer toutes les dépendances (dev + prod)
RUN npm ci

# --- Étape 2 : Build ---
FROM base AS build

WORKDIR /app

# Copier tout le code source
COPY . .

# Générer Prisma Client et appliquer les migrations
RUN npm run setup

# Build Remix pour la production
RUN npm run build

# --- Étape 3 : Production finale ---
FROM node:18-alpine AS production

WORKDIR /app

# Installer seulement les dépendances nécessaires pour la prod
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && npm cache clean --force

# Copier le build et Prisma depuis l'étape précédente
COPY --from=build /app/build ./build
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules ./node_modules

# Exposer le port
EXPOSE 3000

# Définir NODE_ENV
ENV NODE_ENV=production

# CMD avec sh -c pour s'assurer que npm est trouvé
CMD ["sh", "-c", "npm run docker-start"]
