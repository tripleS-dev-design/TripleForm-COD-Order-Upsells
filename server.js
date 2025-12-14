import { createRequestHandler } from "@remix-run/express";
import express from "express";
import compression from "compression";
import morgan from "morgan";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Server.js démarré');
console.log('📁 Répertoire actuel:', __dirname);
console.log('🔧 Port:', process.env.PORT);

const app = express();

// Middleware
app.use(compression());
app.use(morgan("tiny"));

// Fichiers statiques CRITIQUES pour Remix
app.use(express.static(join(__dirname, "public")));
app.use("/build", express.static(join(__dirname, "build/client")));
app.use("/assets", express.static(join(__dirname, "build/client/assets")));

// Handler Remix
console.log('📦 Import du build Remix...');
try {
  const build = await import("./build/server/index.js");
  console.log('✅ Build importé avec succès');
  
  app.all(
    "*",
    createRequestHandler({
      build,
      mode: process.env.NODE_ENV,
    })
  );
} catch (error) {
  console.error('❌ Erreur d\'import du build:', error);
  process.exit(1);
}

// Démarrer le serveur
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ TripleForm COD en ligne sur le port ${port}`);
  console.log(`🌍 URL: ${process.env.SHOPIFY_APP_URL}`);
  console.log(`📂 Build path: ${join(__dirname, "build")}`);
});
