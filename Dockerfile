FROM node:20-alpine

# Installer openssl
RUN apk add --no-cache openssl

# Définir le dossier de travail
WORKDIR /app

ENV NODE_ENV=production

# Copier package.json et package-lock.json
COPY package.json package-lock.json* ./

# Installer TOUTES les dépendances
RUN npm install && npm cache clean --force

# Supprimer Shopify CLI si inutile en production
RUN npm remove @shopify/cli

# Copier le reste du code
COPY . .

# Générer Prisma client
RUN npx prisma generate

# Build Remix pour la production
RUN npm run build

# Vérifier que le build existe
RUN echo "=== VÉRIFICATION DU BUILD ===" && \
    ls -la build/ && \
    ls -la build/client/ && \
    ls -la build/client/assets/ | head -5

# Commande de démarrage
CMD ["sh", "-c", "npx prisma migrate deploy && echo '✅ Migrations appliquées' && node server.js"]
