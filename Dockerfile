FROM node:20-alpine

WORKDIR /app

# Installer les dépendances système (une seule fois)
RUN apk add --no-cache \
    openssl \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    font-noto-emoji \
    && rm -rf /var/lib/apt/lists/* /var/cache/apk/* /usr/share/man /tmp/*

ENV NODE_ENV=production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV CHROMIUM_PATH=/usr/bin/chromium-browser

# Copier les fichiers de dépendances (pour bénéficier du cache)
COPY package.json package-lock.json* ./

# Installer les dépendances npm
RUN npm install && npm cache clean --force

# Supprimer Shopify CLI si inutile
RUN npm remove @shopify/cli

# Copier le reste du code source
COPY . .

# Générer le client Prisma
RUN npx prisma generate

# Build Remix
RUN npm run build

# Vérification rapide
RUN echo "=== BUILD OK ==="

# Commande de démarrage (migration désactivée)
CMD ["sh", "-c", "echo '⚠️ Migration désactivée' && node server.js"]
