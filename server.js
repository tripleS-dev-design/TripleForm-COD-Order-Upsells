import { createRequestHandler } from "@remix-run/express";
import express from "express";
import compression from "compression";
import morgan from "morgan";

console.log('=== SERVER.JS DÉMARRÉ ===');
console.log('Port:', process.env.PORT);
console.log('Node env:', process.env.NODE_ENV);

const app = express();

app.use(morgan("tiny"));
app.use(compression());
app.use(express.static("public"));

// Vérifier si le build existe
try {
  console.log('=== IMPORT DU BUILD ===');
  const build = await import("./build/server/index.js");
  console.log('=== BUILD IMPORTÉ AVEC SUCCÈS ===');
  
  app.all("*", createRequestHandler({ build }));
} catch (error) {
  console.error('=== ERREUR D\'IMPORT DU BUILD ===', error);
  process.exit(1);
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 TripleForm COD démarré sur le port ${port}`);
  console.log(`✅ Prêt à recevoir des requêtes`);
});
