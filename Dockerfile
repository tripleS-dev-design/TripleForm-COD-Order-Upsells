# --- Build Stage ---
FROM node:20-alpine AS builder

RUN apk add --no-cache bash openssl
WORKDIR /app

# 1. Copier et installer TOUTES les dépendances (dont dev) pour le build
COPY package.json package-lock.json* ./
RUN npm ci  # Note : PAS de --omit=dev ici

# 2. Copier le schéma Prisma AVANT le reste et générer le client
COPY prisma ./prisma/
RUN npx prisma generate

# 3. Copier toute l'application et builder
COPY . .
RUN npm run build

# --- Production Stage ---
FROM node:20-alpine AS runner

WORKDIR /app

# 4. Créer le dossier de base de données en tant que root
RUN mkdir -p /app/data && chown -R node:node /app/data
ENV DATABASE_URL="file:/app/data/dev.sqlite"

# 5. Copier uniquement les fichiers nécessaires pour l'exécution
COPY --from=builder --chown=node:node /app/build ./build
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/package.json ./package.json
COPY --from=builder --chown=node:node /app/prisma ./prisma

# 6. Passer à l'utilisateur non-root pour la sécurité
USER node

EXPOSE 3000
ENV NODE_ENV=production

# 7. POINT D'ENTRÉE CORRECT POUR REMIX/SHOPIFY
CMD ["node", "build/server/index.js"]
