# --- Production Stage ---
FROM node:20-alpine AS production
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY --from=build /app/build ./build
COPY --from=build /app/prisma ./prisma
# Ne copiez PAS node_modules depuis le build, installez-les ici pour les bonnes archs.
# COPY --from=build /app/node_modules ./node_modules

# 1. Créez un répertoire pour la DB et donnez les permissions
RUN mkdir -p /app/data && chown -R node:node /app/data
ENV DATABASE_URL="file:/app/data/dev.sqlite"

# 2. Passez à l'utilisateur non-root pour plus de sécurité
USER node

EXPOSE 3000
ENV NODE_ENV=production

# 3. Appliquez les migrations AU DÉMARRAGE (nécessaire si le fichier n'existe pas)
CMD npx prisma migrate deploy && node build/server/index.js
